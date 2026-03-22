// Middleware to validate internal service-to-service calls
// Uses a shared INTERNAL_API_KEY known only to backend services
const internalOnly = (req, res, next) => {
  const key = req.headers['x-internal-api-key'];
  if (!key || key !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({ message: 'Forbidden: internal access only' });
  }
  return next();
};

module.exports = { internalOnly };
