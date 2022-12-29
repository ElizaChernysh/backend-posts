import { body } from 'express-validator';

export const registerValidation = [
  body('email', "Неправильний формат пошти").isEmail(),
  body('password', "Пароль має містити мінімум 5 символів").isLength({ min: 5}),
  body('fullName', "Вкажіть ім'я").isLength({min: 3}),
  body('avatarUrl', "Неправильне посилання на аватарку").optional().isURL(),
];

export const loginValidation = [
  body('email', "Неправильний формат пошти").isEmail(),
  body('password', "Пароль має містити мінімум 5 символів").isLength({ min: 5}),
];