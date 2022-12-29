import { body } from 'express-validator';

export const postCreateValidation = [
  body('title', "Введіть заголовок статті").isLength({ min: 3}).isString(),
  body('text', "Введіть текст статті").isLength({ min: 3}).isString(),
  body('tags', "Неправильний формат тегу (вкажіть масив)").optional().isString(),
  body('imageUrl', "Неправильне посилання на зображення").optional().isString(),
];