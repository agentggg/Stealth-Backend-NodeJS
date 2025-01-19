const axios = require('axios');
const User = require('../models/CustomUser');
const RecordStats = require('../models/Records');
const Tracker = require('../models/WorkoutTracker');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
// Chart canvas setup
const width = 800;
const height = 600;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
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
                ['gersard@yahoo.com'],
                // ['deeirdra21@gmail.com', 'gersard@yahoo.com'],
                'The Lions Den Workout Summary',
                emailMessage,
                pdfPath
            );
        } catch (error) {
            console.error('Failed to send email:', error);
        }
    });
};
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
        res.status(200).send({ status: 'success', message: reports });
    } catch (error) {
        console.error('Error in weekly_report:', error);
        res.status(500).send({ status: 'failed', message: 'Failed to generate workout report' });
    }
};




