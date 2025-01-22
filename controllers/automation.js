const RecordStats = require('../models/Records');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
// Chart canvas setup

require('dotenv').config();

const sendEmailWithAttachment = async (recipients, subject, text, attachmentPath) => {
    try {
        // Create a transporter using your email service credentials
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Or any other email service (e.g., Outlook, Yahoo, etc.)
            auth: {
                user: process.env.EMAIL_USER, // Use environment variable
                pass: process.env.EMAIL_PASS, // Use environment variable
            },
        });

        // Email options
        const mailOptions = {
            from: 'The Lions Den', // Sender address
            to: recipients.join(','), // List of recipients (comma-separated)
            subject: subject, // Subject line
            text: text, // Plain text body
            attachments: [
                {
                    filename: path.basename(attachmentPath), // File name to appear in email
                    path: attachmentPath, // Absolute path to the file
                },
            ],
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ', info.response);
        return info.response;
    } catch (error) {
        console.error('Error sending email: ', error);
        throw error;
    }
};

const generate_report = (reportData) => {
    const doc = new PDFDocument({ margin: 30 });
    const pdfPath = path.join(__dirname, 'workout-report.pdf');
    const writeStream = fs.createWriteStream(pdfPath);

    doc.pipe(writeStream);

    // Add title
    doc.fontSize(18).font('Helvetica-Bold').text('Workout Report', { align: 'center' });
    doc.moveDown(2);

    const headers = ['#', 'Workout', 'Target Muscle', 'Sets', 'Weight', 'Date', 'Pain Level'];
    const columnWidths = [40, 180, 100, 50, 50, 80, 80];
    const pageHeight = doc.page.height - 50;

    let y = doc.y;

    const drawHeaders = () => {
        doc.fontSize(10).font('Helvetica-Bold');
        headers.forEach((header, index) => {
            doc.text(header, 40 + columnWidths.slice(0, index).reduce((a, b) => a + b, 0), y, {
                width: columnWidths[index],
                align: 'center',
            });
        });
        y += 15;
        doc.moveTo(20, y).lineTo(610, y).stroke();
        y += 10;
    };

    const drawRow = (row, index) => {
        row.forEach((cell, colIndex) => {
            doc.text(String(cell), 40 + columnWidths.slice(0, colIndex).reduce((a, b) => a + b, 0), y, {
                width: columnWidths[colIndex],
                align: 'center',
            });
        });

        y += 15;
        if (index < reportData.length - 1) {
            doc.moveTo(20, y).lineTo(610, y).stroke();
            y += 5;
        }
    };

    drawHeaders();

    doc.fontSize(10).font('Helvetica');
    reportData.forEach((record, index) => {
        if (y > pageHeight) {
            doc.addPage();
            y = 40;
            drawHeaders();
        }

        const row = [
            index + 1,
            record.Workout || 'N/A',
            record['Target Muscle'] || 'N/A',
            record['Set Count'] || 0,
            record.Weight || 0,
            record.Date || 'N/A',
            record['Pain Level'] || 0,
        ];

        drawRow(row, index);
    });

    doc.end();

    writeStream.on('finish', async () => {
        console.log('PDF successfully created:', pdfPath);

        const emailMessage = `Hello! I’m excited to share the attached file, which contains a comprehensive overview of the workout information for Stevenson’s training program for the week.
Within this document, you’ll find detailed metrics such as exercise routines, duration, intensity, and performance outcomes.
            
Please review it thoroughly and let’s collaborate on enhancing the training strategies for next week.
        `;

        try {
            await sendEmailWithAttachment(
                // ['gersard@yahoo.com'],
                ['deeirdra21@gmail.com', 'gersard@yahoo.com'],
                'The Lions Den Workout Summary',
                emailMessage,
                pdfPath
            );
        } catch (error) {
            console.error('Failed to send email:', error);
        }
    });
};

// make this dynamic, versus one user
exports.weekly_report = async (req, res) => {
    try {
        const reports = [];
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 6); // Include today as day 1

        const all_records = await RecordStats.find().populate('user_id').populate('workouts');

        all_records.forEach((record) => {
            // Check if the workout record falls within the last 7 days
            const recordDate = new Date(record.date || 'N/A');
            if (
                !isNaN(recordDate) &&
                recordDate >= sevenDaysAgo &&
                recordDate <= today
            ) {
                const hasWorkouts = Array.isArray(record.workouts) && record.workouts.length > 0;

                reports.push({
                    Workout: hasWorkouts ? record.workouts[0].name : 'N/A',
                    'Target Muscle': hasWorkouts ? record.workouts[0].bodyPart : 'N/A',
                    "Set Count": record.sets || 0,
                    Reps: record.reps || 0,
                    Weight: record.weight || 0,
                    Date: record.date || 'N/A',
                    "Pain Level": record.workoutIntensity || 'N/A',
                    'Day of the Week': record.day_of_week || 'N/A',
                });
            }
        });

        // Check if there are reports to generate
        if (reports.length === 0) {
            return res.status(200).send({
                status: 'success',
                message: 'No workout records found within the last 7 days',
            });
        }
    
        await generate_report(reports);
        res.status(200).send({ status: 'success', message: "Successfully sent the report out" });
    } catch (error) {
        console.error('Error in weekly_report:', error);
        res.status(500).send({ status: 'failed', message: 'Failed to generate workout report' });
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
  



