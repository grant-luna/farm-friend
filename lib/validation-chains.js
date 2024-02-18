const { check } = require('express-validator');

const validateFirstName = () => {
  return check('firstName')
    .exists()
    .withMessage('You must enter a First Name')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('First Name must not be empty')
    .bail()
    .isAlpha()
    .withMessage('First Name must only include alphabetic characters');
}

const validateLastName = () => {
  return check('lastName')
    .exists()
    .withMessage('You must enter a Last Name')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Last Name must not be empty')
    .bail()
    .isAlpha()
    .withMessage('Last Name must only include alphabetic characters');
}

const validateEmail = () => {
  return check('email')
    .exists()
    .withMessage('You must enter an email address')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Email must not be empty')
    .bail()
    .isEmail()
    .withMessage('You must provide a valid email address')
}

const validatePassword = () => {
  return check('password')
    .exists()
    .withMessage('You must enter a password')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Password must not be empty')
    .bail()
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage('Password must be minimum 8 characters in length and include at least one lowercase character, one uppercase character, one number, and a special character');
}

module.exports = {
  validateFirstName,
  validateLastName,
  validateEmail,
  validatePassword,
}