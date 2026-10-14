
const { randomUUID } = require('crypto');

module.exports = function requestId(req, res, next) {
  // 1. Generate a unique ID
  const id = randomUUID();

  // 2. Attach the ID to the request object
  req.id = id;

  // 3. Set the ID in the response header
  res.setHeader('X-Request-Id', id);

  // 4. Pass control to the next middleware
  next();
};
