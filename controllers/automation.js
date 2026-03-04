const RecordStats = require('../models/Records');
const Workouts = require('../models/WorkoutManagement');
const nodemailer = require('nodemailer');

require('dotenv').config();

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Stretch'];

const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const formatRecordDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return null;
    const [month, day, year] = dateString.split('/').map(Number);
    if (!month || !day || !year) return null;

    const parsed = new Date(year, month - 1, day);
    if (Number.isNaN(parsed.getTime())) return null;
    parsed.setHours(12, 0, 0, 0);
    return parsed;
};

const intensityToScore = (intensity) => {
    if (!intensity) return 0;
    const normalized = String(intensity).toLowerCase();
    if (normalized.includes('high')) return 3;
    if (normalized.includes('mod')) return 2;
    if (normalized.includes('low')) return 1;
    const numeric = Number(normalized);
    return Number.isFinite(numeric) ? numeric : 0;
};

const getPctChange = (current, previous) => {
    if (previous === 0 && current === 0) return 0;
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
};

const getChangeLabel = (current, previous) => {
    const delta = current - previous;
    const pct = getPctChange(current, previous);
    const sign = delta >= 0 ? '+' : '';
    return `${sign}${delta} (${sign}${pct.toFixed(1)}%)`;
};

const createDummyWeeklyPayload = (name, weekStart, weekEnd) => {
    const committedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const completedDays = ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday', 'Sunday'];
    const missedDays = committedDays.filter((day) => !completedDays.includes(day));

    const baseWorkouts = [
        { name: 'Barbell Back Squat', bodyPart: 'legs' },
        { name: 'Romanian Deadlift', bodyPart: 'hamstrings' },
        { name: 'Walking Lunges', bodyPart: 'legs' },
        { name: 'Bench Press', bodyPart: 'chest' },
        { name: 'Incline Dumbbell Press', bodyPart: 'chest' },
        { name: 'Seated Row', bodyPart: 'back' },
        { name: 'Pull Ups', bodyPart: 'lats' },
        { name: 'Shoulder Press', bodyPart: 'shoulders' },
        { name: 'Lateral Raise', bodyPart: 'shoulders' },
        { name: 'Bicep Curl', bodyPart: 'biceps' },
        { name: 'Tricep Rope Pushdown', bodyPart: 'triceps' },
        { name: 'Cable Crunch', bodyPart: 'abs' },
    ];

    const recentRecords = [];
    const intensities = ['Low', 'Moderate', 'High'];

    // Large dummy dataset for QA: 28 sessions across the week.
    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + dayOffset);
        const dateString = currentDate.toLocaleDateString('en-US');
        const dayName = dayOrder[dayOffset];

        for (let session = 0; session < 4; session += 1) {
            const idx = (dayOffset * 4 + session) % baseWorkouts.length;
            const workout = baseWorkouts[idx];
            recentRecords.push({
                date: dateString,
                day_of_week: dayName,
                sets: 3 + ((dayOffset + session) % 4),
                reps: 8 + ((dayOffset + session) % 7),
                weight: 85 + (idx * 5) + (session * 10),
                workoutIntensity: intensities[(dayOffset + session) % intensities.length],
                workouts: [workout],
            });
        }
    }

    const summarize = (items) => {
        const totalSets = items.reduce((sum, item) => sum + (Number(item.sets) || 0), 0);
        const totalReps = items.reduce((sum, item) => sum + (Number(item.reps) || 0), 0);
        const totalWeight = items.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
        const intensitySum = items.reduce((sum, item) => sum + intensityToScore(item.workoutIntensity), 0);
        return {
            sessions: items.length,
            totalSets,
            totalReps,
            totalWeight,
            avgIntensity: items.length ? intensitySum / items.length : 0,
        };
    };

    const currentStats = summarize(recentRecords);
    const previousStats = {
        sessions: Math.max(currentStats.sessions - 6, 0),
        totalSets: Math.max(currentStats.totalSets - 22, 0),
        totalReps: Math.max(currentStats.totalReps - 70, 0),
        totalWeight: Math.max(currentStats.totalWeight - 640, 0),
        avgIntensity: Math.max(currentStats.avgIntensity - 0.18, 0),
    };

    const commitmentRate = (completedDays.length / committedDays.length) * 100;

    return {
        name,
        weekStart,
        weekEnd,
        commitmentRate,
        committedDays,
        completedDays,
        missedDays,
        currentStats,
        previousStats,
        recentRecords,
    };
};

const buildWeeklyHtml = (payload) => {
    const {
        name,
        weekStart,
        weekEnd,
        commitmentRate,
        committedDays,
        completedDays,
        missedDays,
        currentStats,
        previousStats,
        recentRecords,
    } = payload;

    const commitmentWidth = Math.max(0, Math.min(100, Number(commitmentRate.toFixed(1))));
    const completedBadges = completedDays.length
        ? completedDays.map((day) => `<span class="badge done">${day}</span>`).join('')
        : '<span class="muted">No committed days completed this week yet.</span>';
    const missedBadges = missedDays.length
        ? missedDays.map((day) => `<span class="badge missed">${day}</span>`).join('')
        : '<span class="muted">You completed everything you committed to.</span>';

    const recordRows = recentRecords.length
        ? recentRecords.map((record) => {
            const workoutName = Array.isArray(record.workouts) && record.workouts[0]?.name ? record.workouts[0].name : 'Workout';
            const target = Array.isArray(record.workouts) && record.workouts[0]?.bodyPart ? record.workouts[0].bodyPart : 'N/A';
            return `
                <tr>
                    <td>${record.date || 'N/A'}</td>
                    <td>${workoutName}</td>
                    <td>${target}</td>
                    <td>${record.sets || 0}</td>
                    <td>${record.reps || 0}</td>
                    <td>${record.weight || 0}</td>
                    <td>${record.workoutIntensity || 'N/A'}</td>
                </tr>
            `;
        }).join('')
        : '<tr><td colspan="7" class="muted">No workouts logged this week.</td></tr>';

    return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Weekly Progress Report</title>
  <style>
    body { margin:0; padding:0; background:#f2f5f9; font-family:Arial,sans-serif; color:#1f2937; }
    .container { width:100%; max-width:760px; margin:0 auto; padding:16px; }
    .card { background:#ffffff; border-radius:14px; padding:18px; margin-bottom:14px; border:1px solid #e5e7eb; }
    .hero { background:linear-gradient(140deg,#0f766e,#0ea5a3); color:#ffffff; }
    h1 { margin:0 0 8px; font-size:24px; line-height:1.2; }
    h2 { margin:0 0 12px; font-size:18px; color:#0f172a; }
    p { margin:0 0 10px; line-height:1.45; }
    .grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
    .stat { background:#f8fafc; border-radius:10px; padding:12px; border:1px solid #e2e8f0; }
    .stat .label { font-size:12px; color:#475569; margin-bottom:6px; text-transform:uppercase; letter-spacing:.04em; }
    .stat .value { font-size:20px; font-weight:700; color:#0f172a; }
    .stat .delta { margin-top:4px; font-size:12px; color:#0369a1; }
    .progress-wrap { background:#e2e8f0; height:12px; border-radius:999px; overflow:hidden; }
    .progress-fill { height:100%; background:#16a34a; width:${commitmentWidth}%; }
    .badge { display:inline-block; font-size:12px; padding:6px 9px; border-radius:999px; margin:0 6px 6px 0; }
    .done { background:#dcfce7; color:#166534; border:1px solid #86efac; }
    .missed { background:#fee2e2; color:#991b1b; border:1px solid #fca5a5; }
    .muted { color:#64748b; font-size:13px; }
    table { width:100%; border-collapse:collapse; font-size:13px; }
    th, td { text-align:left; border-bottom:1px solid #e2e8f0; padding:8px 6px; vertical-align:top; }
    th { color:#334155; font-size:12px; text-transform:uppercase; letter-spacing:.04em; }
    .foot { color:#475569; font-size:13px; }
    @media (max-width: 600px) {
      .container { padding:10px; }
      h1 { font-size:20px; }
      .grid { grid-template-columns:1fr; }
      .card { padding:14px; }
      table { font-size:12px; }
      th, td { padding:7px 4px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card hero">
      <h1>${name}, your weekly report is ready</h1>
      <p>${formatDate(weekStart)} to ${formatDate(weekEnd)}</p>
      <p>You made meaningful progress. Keep stacking these sessions and your consistency will compound.</p>
    </div>

    <div class="card">
      <h2>Progress Scoreboard</h2>
      <div class="grid">
        <div class="stat">
          <div class="label">Sessions</div>
          <div class="value">${currentStats.sessions}</div>
          <div class="delta">vs last week: ${getChangeLabel(currentStats.sessions, previousStats.sessions)}</div>
        </div>
        <div class="stat">
          <div class="label">Total Sets</div>
          <div class="value">${currentStats.totalSets}</div>
          <div class="delta">vs last week: ${getChangeLabel(currentStats.totalSets, previousStats.totalSets)}</div>
        </div>
        <div class="stat">
          <div class="label">Total Reps</div>
          <div class="value">${currentStats.totalReps}</div>
          <div class="delta">vs last week: ${getChangeLabel(currentStats.totalReps, previousStats.totalReps)}</div>
        </div>
        <div class="stat">
          <div class="label">Volume (Weight)</div>
          <div class="value">${currentStats.totalWeight}</div>
          <div class="delta">vs last week: ${getChangeLabel(currentStats.totalWeight, previousStats.totalWeight)}</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>Commitment Tracker</h2>
      <p><strong>Completion:</strong> ${commitmentRate.toFixed(1)}% (${completedDays.length}/${Math.max(committedDays.length, 1)} committed days)</p>
      <div class="progress-wrap"><div class="progress-fill"></div></div>
      <p style="margin-top:12px;"><strong>What you committed to:</strong> ${committedDays.length ? committedDays.join(', ') : 'No scheduled commitment days found'}</p>
      <p><strong>Completed:</strong></p>
      <div>${completedBadges}</div>
      <p style="margin-top:8px;"><strong>Not completed:</strong></p>
      <div>${missedBadges}</div>
    </div>

    <div class="card">
      <h2>Intensity and Recovery Signal</h2>
      <p>Average intensity score this week: <strong>${currentStats.avgIntensity.toFixed(2)}</strong> (last week: <strong>${previousStats.avgIntensity.toFixed(2)}</strong>)</p>
      <p class="muted">This reflects your logged effort level. Keep your training hard but controlled.</p>
    </div>

    <div class="card">
      <h2>This Week's Session Log</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Workout</th>
            <th>Target</th>
            <th>Sets</th>
            <th>Reps</th>
            <th>Weight</th>
            <th>Intensity</th>
          </tr>
        </thead>
        <tbody>
          ${recordRows}
        </tbody>
      </table>
    </div>

    <div class="card">
      <p class="foot">
        Keep showing up. Consistency beats perfection.
        If you missed days this week, lock in one small win first thing next week and build momentum.
      </p>
    </div>
  </div>
</body>
</html>
    `;
};

const sendWeeklyEmail = async ({ recipients, subject, text, html }) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            const missing = [];
            if (!process.env.EMAIL_USER) missing.push('EMAIL_USER');
            if (!process.env.EMAIL_PASS) missing.push('EMAIL_PASS');
            throw new Error(`Email configuration missing: ${missing.join(', ')}`);
        }

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: 'The Lions Den',
            to: recipients.join(','),
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ', info.response);
        return info.response;
    } catch (error) {
        console.error('Error sending email: ', error);
        throw error;
    }
};

const sendWeeklyReports = async ({ targetEmail, targetUsername } = {}) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - 6);
    currentWeekStart.setHours(0, 0, 0, 0);

    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(currentWeekStart.getDate() - 7);
    const previousWeekEnd = new Date(currentWeekStart);
    previousWeekEnd.setDate(currentWeekStart.getDate() - 1);
    previousWeekEnd.setHours(23, 59, 59, 999);

    const allRecords = await RecordStats.find({})
        .populate('user_id', 'fullName email username')
        .populate('workouts', 'name bodyPart')
        .lean();

    const allCommitments = await Workouts.find({})
        .populate('user_id', 'email username')
        .populate('day', 'day')
        .lean();

    const userCommitmentDays = new Map();
    allCommitments.forEach((entry) => {
        const userId = entry?.user_id?._id?.toString();
        const day = entry?.day?.day;
        if (!userId || !day) return;
        if (!userCommitmentDays.has(userId)) userCommitmentDays.set(userId, new Set());
        userCommitmentDays.get(userId).add(day);
    });

    const recordsByUser = new Map();
    allRecords.forEach((record) => {
        const userId = record?.user_id?._id?.toString();
        const recordDate = formatRecordDate(record.date);
        if (!userId || !recordDate) return;
        if (recordDate < previousWeekStart || recordDate > today) return;
        if (!recordsByUser.has(userId)) recordsByUser.set(userId, []);
        recordsByUser.get(userId).push({ ...record, _parsedDate: recordDate });
    });

    const targetEmailNormalized = targetEmail ? String(targetEmail).trim().toLowerCase() : '';
    const targetUsernameNormalized = targetUsername ? String(targetUsername).trim().toLowerCase() : '';

    let sentCount = 0;
    const sentTo = [];

    for (const [, records] of recordsByUser.entries()) {
        const user = records[0].user_id;
        if (!user?.email) continue;

        const matchesTargetEmail = targetEmailNormalized
            ? String(user.email).trim().toLowerCase() === targetEmailNormalized
            : true;
        const matchesTargetUsername = targetUsernameNormalized
            ? String(user.username || '').trim().toLowerCase() === targetUsernameNormalized
            : true;
        if (!matchesTargetEmail || !matchesTargetUsername) continue;

        const currentWeekRecords = records
            .filter((record) => record._parsedDate >= currentWeekStart && record._parsedDate <= today)
            .sort((a, b) => b._parsedDate - a._parsedDate);
        const previousWeekRecords = records.filter((record) => record._parsedDate >= previousWeekStart && record._parsedDate <= previousWeekEnd);

        const summarize = (items) => {
            const totalSets = items.reduce((sum, item) => sum + (Number(item.sets) || 0), 0);
            const totalReps = items.reduce((sum, item) => sum + (Number(item.reps) || 0), 0);
            const totalWeight = items.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
            const intensitySum = items.reduce((sum, item) => sum + intensityToScore(item.workoutIntensity), 0);
            return {
                sessions: items.length,
                totalSets,
                totalReps,
                totalWeight,
                avgIntensity: items.length ? intensitySum / items.length : 0,
            };
        };

        const currentStats = summarize(currentWeekRecords);
        const previousStats = summarize(previousWeekRecords);

        const committedSet = userCommitmentDays.get(user._id.toString()) || new Set();
        const committedDays = Array.from(committedSet).sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
        const completedDaysSet = new Set(currentWeekRecords.map((record) => record.day_of_week).filter(Boolean));
        const completedDays = committedDays.filter((day) => completedDaysSet.has(day));
        const missedDays = committedDays.filter((day) => !completedDaysSet.has(day));
        const commitmentBase = committedDays.length || 1;
        const commitmentRate = (completedDays.length / commitmentBase) * 100;

        const html = buildWeeklyHtml({
            name: user.fullName || user.username || 'Athlete',
            weekStart: currentWeekStart,
            weekEnd: today,
            commitmentRate,
            committedDays,
            completedDays,
            missedDays,
            currentStats,
            previousStats,
            recentRecords: currentWeekRecords,
        });

        const text = `${user.fullName || user.username}, your weekly report is ready.
Commitment completion: ${commitmentRate.toFixed(1)}%.
Sessions: ${currentStats.sessions} (last week: ${previousStats.sessions}).
Sets: ${currentStats.totalSets} (last week: ${previousStats.totalSets}).
Reps: ${currentStats.totalReps} (last week: ${previousStats.totalReps}).
Weight volume: ${currentStats.totalWeight} (last week: ${previousStats.totalWeight}).`;

        await sendWeeklyEmail({
            recipients: [user.email],
            subject: `The Lions Den Weekly Progress Report (${formatDate(currentWeekStart)} - ${formatDate(today)})`,
            text,
            html,
        });

        sentCount += 1;
        sentTo.push(user.email);
    }

    return { sentCount, sentTo };
};

exports.weekly_report = async (req, res) => {
    try {
        const { sentCount } = await sendWeeklyReports();
        if (sentCount === 0) {
            return res.status(200).send({
                status: 'success',
                message: 'No workout records found for the reporting period',
            });
        }
        res.status(200).send({
            status: 'success',
            message: `Successfully sent ${sentCount} weekly report email(s)`,
        });
    } catch (error) {
        console.error('Error in weekly_report:', error);
        res.status(500).send({ status: 'failed', message: 'Failed to generate workout report' });
    }
};

exports.run_weekly_report_job = async () => {
    const { sentCount } = await sendWeeklyReports();
    return { sentCount };
};

exports.weekly_report_test = async (req, res) => {
    try {
        const targetEmail = req.body?.email || 'deeirdra21@gmail.com';
        const targetUsername = req.body?.username || '';
        const targetName = req.body?.name || 'Deeirdra';
        const dryRun = Boolean(req.body?.dryRun);
        const forceDummy = req.body?.dummy !== undefined ? Boolean(req.body?.dummy) : true;

        if (dryRun) {
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            const currentWeekStart = new Date(today);
            currentWeekStart.setDate(today.getDate() - 6);
            currentWeekStart.setHours(0, 0, 0, 0);
            const dummyPayload = createDummyWeeklyPayload(targetName, currentWeekStart, today);
            const html = buildWeeklyHtml(dummyPayload);

            return res.status(200).send({
                status: 'success',
                message: 'Dry-run generated HTML successfully (email not sent)',
                previewTarget: targetEmail,
                html,
            });
        }

        const result = await sendWeeklyReports({ targetEmail, targetUsername });

        if (result.sentCount === 0) {
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            const currentWeekStart = new Date(today);
            currentWeekStart.setDate(today.getDate() - 6);
            currentWeekStart.setHours(0, 0, 0, 0);
            const fallbackPayload = forceDummy
                ? createDummyWeeklyPayload(targetName, currentWeekStart, today)
                : {
                    name: targetName,
                    weekStart: currentWeekStart,
                    weekEnd: today,
                    commitmentRate: 0,
                    committedDays: [],
                    completedDays: [],
                    missedDays: [],
                    currentStats: { sessions: 0, totalSets: 0, totalReps: 0, totalWeight: 0, avgIntensity: 0 },
                    previousStats: { sessions: 0, totalSets: 0, totalReps: 0, totalWeight: 0, avgIntensity: 0 },
                    recentRecords: [],
                };
            const html = buildWeeklyHtml(fallbackPayload);

            const text = `${targetName}, your weekly report preview is ready.
No matching workout records were found, so this is a template preview with ${forceDummy ? 'dummy metrics and session data' : 'zeroed metrics'}.`;

            await sendWeeklyEmail({
                recipients: [targetEmail],
                subject: `The Lions Den Weekly Progress Report PREVIEW (${formatDate(currentWeekStart)} - ${formatDate(today)})`,
                text,
                html,
            });

            return res.status(200).send({
                status: 'success',
                message: `No matching records found. Sent ${forceDummy ? 'dummy-data' : 'zero-data'} preview report to ${targetEmail}`,
            });
        }

        res.status(200).send({
            status: 'success',
            message: `Test weekly report sent to ${result.sentTo.join(', ')}`,
        });
    } catch (error) {
        console.error('Error in weekly_report_test:', error);
        res.status(500).send({
            status: 'failed',
            message: `Failed to send test weekly report: ${error.message || 'Unknown error'}`,
        });
    }
};

exports.yesterday_report = async (req, res) => {
    try{
        const {username} = req.body
        const today = new Date();
        const sevenDaysAgo = new Date();
        const yesterday = new Date();
        
        // Adjust the dates
        sevenDaysAgo.setDate(today.getDate() - 8); // Exclude today from the range
        yesterday.setDate(today.getDate() - 1);
        const dayName = yesterday.toLocaleDateString('en-US', { weekday: 'long' });

        // Format the dates as MM/DD/YYYY
        const formatDate = (date) => date.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        });
        
        const formattedYesterday = formatDate(yesterday);        
        const formattedSevenDaysAgo = formatDate(sevenDaysAgo);
        const all_stats = await RecordStats.find({}).populate('user_id').populate('workouts')
        const yesterdays_report = all_stats.filter((each_workout)=> {
            if (
                (each_workout.user_id.username == username) 
                && (each_workout.date == formattedYesterday)
                && (each_workout.day_of_week == dayName)
            ){
                return true
            }
        })
        const last_week_report = all_stats.filter((each_workout)=> {
            if (
                (each_workout.user_id.username == username) 
                && (each_workout.date == formattedSevenDaysAgo)
                && (each_workout.day_of_week == dayName)
            ){
                return true
            }
        })
        const response = [
            {"yesterdays_report":yesterdays_report},
            {"last_week_report":last_week_report}
        ] 
        res.status(200).send({ status: 'success', message: response });
    }

    catch (error) {
        console.error('Error in weekly_report:', error);
        res.status(500).send({ status: 'failed', message: 'Failed to generate workout report' });
    }
}

exports.today_report = async (req, res) => {
    try {
      const { username } = req.body;
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
  
      const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  
      const formatDate = (date) => date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
  
      const formattedToday = formatDate(today);
      const formattedSevenDaysAgo = formatDate(sevenDaysAgo);
  
      const stats = await RecordStats.find({})
        .populate({
          path: 'user_id',
          select: 'username email fullName',
        })
        .populate({
          path: 'workouts',
          select: 'name bodyPart equipment gifUrl',
        })
        .lean();
        const all_stats = stats.map(stat => {
            const sortedWorkouts = Array.isArray(stat.workouts)
              ? stat.workouts.sort((a, b) => {
                  if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                  if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                  return 0;
                })
              : []; // If workouts is not an array, fallback to an empty array
          
            return {
              ...stat,
              workouts: sortedWorkouts,
            };
          });
          

      const today_report = all_stats.filter((stat) =>
        stat.user_id.username === username &&
        stat.date === formattedToday &&
        stat.day_of_week === dayName
      );
  
      const last_week_report = all_stats.filter((stat) =>
        stat.user_id.username === username &&
        stat.date === formattedSevenDaysAgo &&
        stat.day_of_week === dayName
      );
  
      const response = [
        { today_report },
        { last_week_report },
      ];
  
  
      res.status(200).json({
        status: 'success',
        message: response,
      });
    } catch (error) {
      console.error('Error in today_report:', error);
      res.status(500).send({ status: 'error', message: 'An error occurred' });
    }
  };
  
