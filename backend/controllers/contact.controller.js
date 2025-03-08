const { body, validationResult } = require('express-validator');
const { sendEmail } = require('../services/communication.service');

// Helper function to create styled HTML email template
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
            <p>&copy; ${new Date().getFullYear()} GatiYan. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

module.exports.submitContactForm = async (req, res) => {
  // Validation check
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, message } = req.body;

  try {
    // Email to User (Confirmation)
    const userEmailBody = `
      <p>Hello ${name},</p>
      <p>Thank you for reaching out to GatiYan! We have received your message:</p>
      <p><strong>Your Message:</strong> ${message}</p>
      <p>Our team will get back to you soon.</p>
      <p>Best regards,<br>GatiYan Team</p>
    `;
    const userEmailHtml = createEmailTemplate('Contact Form Submission', userEmailBody);
    await sendEmail(email, 'Thank You for Contacting GatiYan', userEmailHtml);

    // Email to Admin (Notification)
    const adminEmailBody = `
      <p>Hello Admin,</p>
      <p>A new contact form submission has been received:</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong> ${message}</p>
      <p>Please respond to the user at your earliest convenience.</p>
    `;
    const adminEmailHtml = createEmailTemplate('New Contact Form Submission', adminEmailBody);
    await sendEmail(process.env.ADMIN_EMAIL, 'New Contact Form Submission', adminEmailHtml);

    res.status(200).json({ message: 'Contact form submitted successfully. We will get back to you soon!' });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ message: 'Failed to submit contact form. Please try again later.' });
  }
};