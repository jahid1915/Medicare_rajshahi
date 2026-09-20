/**
 * Standardized API response helpers
 * All endpoints must use these helpers for consistent response format
 */

const successResponse = (res, data = {}, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const errorResponse = (res, message = "An error occurred", statusCode = 400, code = null, errors = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
    errors
  });
};

const paginatedResponse = (res, data, total, page, limit, message = "Success") => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  });
};

module.exports = { successResponse, errorResponse, paginatedResponse };
