
module.exports = function logger(req, res, next) {
  res.on('finish', () => {
    const resId = req.id
      ? `[${req.id.substring(0, 8)}] `
      : '';

    console.log(
      `${resId}${req.method} ${req.path} ${res.statusCode}`
    );
  });

  next();
};
