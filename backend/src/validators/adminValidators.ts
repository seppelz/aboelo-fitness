import { body, param, query } from 'express-validator';

export const createAdminUserValidation = [
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
  body('age')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('Alter muss eine Zahl zwischen 0 und 120 sein.'),
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Rolle muss "admin" oder "user" sein.'),
];

export const updateAdminUserValidation = [
  param('id')
    .isMongoId()
    .withMessage('Ungültige Benutzer-ID.'),
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name muss zwischen 2 und 100 Zeichen lang sein.'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Eine gültige E-Mail-Adresse ist erforderlich.'),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Passwort muss mindestens 8 Zeichen lang sein.')
    .matches(/[A-Z]/)
    .withMessage('Passwort muss mindestens einen Großbuchstaben enthalten.')
    .matches(/[a-z]/)
    .withMessage('Passwort muss mindestens einen Kleinbuchstaben enthalten.')
    .matches(/[0-9]/)
    .withMessage('Passwort muss mindestens eine Zahl enthalten.'),
  body('age')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('Alter muss eine Zahl zwischen 0 und 120 sein.'),
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Rolle muss "admin" oder "user" sein.'),
];

export const deleteAdminUserValidation = [
  param('id')
    .isMongoId()
    .withMessage('Ungültige Benutzer-ID.'),
];

export const analyticsQueryValidation = [
  query('range')
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage('range muss zwischen 1 und 60 Tagen liegen.'),
  query('from')
    .optional()
    .isISO8601()
    .withMessage('from muss ein gültiges Datum sein.'),
  query('to')
    .optional()
    .isISO8601()
    .withMessage('to muss ein gültiges Datum sein.'),
];
