const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const contactController = require('../controllers/contact.controller');

router.post(
  '/submit',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  contactController.submitContactForm
);

module.exports = router;