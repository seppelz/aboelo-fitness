import { body } from 'express-validator';

export const registerValidationRules = [
  body('name')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name muss zwischen 2 und 100 Zeichen lang sein.'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Eine gültige E-Mail-Adresse ist erforderlich.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Passwort muss mindestens 8 Zeichen lang sein.')
    .matches(/[A-Z]/)
    .withMessage('Passwort muss mindestens einen Großbuchstaben enthalten.')
    .matches(/[a-z]/)
    .withMessage('Passwort muss mindestens einen Kleinbuchstaben enthalten.')
    .matches(/[0-9]/)
    .withMessage('Passwort muss mindestens eine Zahl enthalten.'),
  body('passwordConfirmation')
    .optional()
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwörter stimmen nicht überein.'),
  body('acceptTerms')
    .optional()
    .custom((value) => value === true)
    .withMessage('Die Nutzungsbedingungen müssen akzeptiert werden.'),
  body('age')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('Alter muss eine Zahl zwischen 0 und 120 sein.'),
];

export const loginValidationRules = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Eine gültige E-Mail-Adresse ist erforderlich.'),
  body('password')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Passwort ist erforderlich.'),
];

export const forgotPasswordValidationRules = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Eine gültige E-Mail-Adresse ist erforderlich.'),
];

export const resetPasswordValidationRules = [
  body('token')
    .isString()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Reset-Token ist ungültig.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Passwort muss mindestens 8 Zeichen lang sein.')
    .matches(/[A-Z]/)
    .withMessage('Passwort muss mindestens einen Großbuchstaben enthalten.')
    .matches(/[a-z]/)
    .withMessage('Passwort muss mindestens einen Kleinbuchstaben enthalten.')
    .matches(/[0-9]/)
    .withMessage('Passwort muss mindestens eine Zahl enthalten.'),
  body('passwordConfirmation')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwörter stimmen nicht überein.'),
];
