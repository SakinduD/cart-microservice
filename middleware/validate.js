/**
 * middleware/validate.js – Input validation rules (express-validator)
 *
 * Security rationale:
 *   • Validates & sanitizes every user-supplied field before it reaches
 *     the controller.  This prevents NoSQL injection, type-confusion, and
 *     ensures data integrity at the boundary.
 *   • validationResult is checked by a shared handler that returns 400
 *     with structured error details if any rule fails.
 */

const { body, param, validationResult } = require('express-validator');
const apiResponse = require('../helpers/apiResponse');

// ── Shared error handler ───────────────────────────────────────────────────
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.error(res, 'Validation failed', 400, errors.array());
  }
  next();
};

// ── Rule sets ──────────────────────────────────────────────────────────────

/** POST /cart/add */
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

/** DELETE /cart/remove */
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

/** GET /cart/:userId  &  DELETE /cart/clear/:userId */
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
