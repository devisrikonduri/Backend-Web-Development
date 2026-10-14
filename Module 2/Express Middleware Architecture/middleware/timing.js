
module.exports = function timing(req, res, next) {
  // 1. Record the start time
  const start = Date.now();

  // 2. Log elapsed time when the response finishes
  res.on('finish', () => {
    const ms = Date.now() - start;
    const shortId = req.id ? `[${req.id.substring(0, 8)}] ` : '';

    console.log(
      `${shortId}${req.method} ${req.path} took ${ms}ms`
    );
  });

  // 3. Continue to the next middleware immediately
  next();
};
