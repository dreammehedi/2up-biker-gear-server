const paginationMiddleware = (req, res, next) => {
  // Get page and limit from query params with defaults
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;

  // Calculate skip value
  const skip = (page - 1) * limit;
  req.pagination = { page, limit, skip };
  next();
};

export default paginationMiddleware;
