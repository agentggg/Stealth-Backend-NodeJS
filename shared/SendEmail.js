var nodemailer = require('nodemailer');

// Create a transporter
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'raw2535@gmail.com',
    pass: 'ylaqjtfyssmzbmcb' // Store this in environment variables for better security
  }
});

// Function to send an email
function SendEmail(to, subject, text, callback) {
  var mailOptions = {
    from: 'Stealth Workout Squad',
    to: to,
    subject: subject,
    text: text
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
      callback(error, null);  // Callback with error
    } else {
      console.log('Email sent: ' + info.response);
      callback(null, info.response);  // Callback with success
    }
  });
}

// Export the function to use in other files
module.exports = SendEmail;
