/**
 * helpers/apiResponse.js – Standardised JSON response helper
 *
 * Every API response follows the same shape so consumers can always
 * rely on { success, message, data } regardless of status code.
 */

exports.success = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

exports.error = (res, message, statusCode = 500, details = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
  });
};
