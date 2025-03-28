const nodemailer = require('nodemailer');
const axios = require('axios');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper: Create a styled HTML email template
const createEmailTemplate = (heading, messageBody) => {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f2f2f2; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border: 1px solid #dddddd; }
          .header { background: #007BFF; color: #ffffff; padding: 10px; text-align: center; }
          .content { margin: 20px 0; font-size: 16px; color: #333333; line-height: 1.5; }
          .footer { text-align: center; font-size: 12px; color: #888888; margin-top: 20px; }
          a { color: #007BFF; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${heading}</h2>
          </div>
          <div class="content">
            ${messageBody}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Send OTP via email with HTML template
module.exports.sendEmailOTP = async (email, otp) => {
  if (!email) {
    console.error('Error: No recipient email provided for OTP.');
    throw new Error('No recipient email provided');
  }

  const htmlContent = createEmailTemplate(
    'Your OTP for Signup',
    `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>GatiYan Security Verification</title>
    <style>
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            background-color: #f9f9f9; 
            color: #333; 
        }
        .security-container {
            max-width: 500px;
            margin: 20px auto;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            padding: 30px;
            text-align: center;
        }
        .otp-highlight {
            background-color: #000;
            color: white;
            padding: 15px;
            font-size: 26px;
            letter-spacing: 6px;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="security-container">
        <h2>Secure Account Access</h2>
        <p>Hello,</p>
        <p>To protect your account, please use the following One-Time Password:</p>
        <div class="otp-highlight">${otp}</div>
        <p>🔒 This code is valid for 10 minutes and can be used only once.</p>
        <p>Never share this code with anyone, including GatiYan staff.</p>
    </div>
</body>
</html>`
  );

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Signup',
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    // console.log(`✅ OTP email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};


// Send a generic email using HTML content and styled template
module.exports.sendEmail = async (to, subject, html) => {
  if (!to) {
    console.error('Error: No recipient email provided for sending email.');
    throw new Error('No recipient email provided');
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    // console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error('Failed to send email');
  }
};
