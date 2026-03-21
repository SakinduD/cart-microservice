const { body, param, validationResult } = require('express-validator');
const apiResponse = require('../helpers/apiResponse');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.error(res, 'Validation failed', 400, errors.array());
  }
  next();
};

const addItemRules = [
  body('userId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('userId is required and must be a non-empty string'),
  body('productId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('productId is required and must be a non-empty string'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('quantity must be an integer ≥ 1'),
  handleValidationErrors,
];

const removeItemRules = [
  body('userId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('userId is required'),
  body('productId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('productId is required'),
  handleValidationErrors,
];

const userIdParamRules = [
  param('userId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('userId param is required'),
  handleValidationErrors,
];

module.exports = {
  addItemRules,
  removeItemRules,
  userIdParamRules,
};
