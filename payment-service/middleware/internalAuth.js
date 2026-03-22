/**
 * Internal Service-to-Service Authentication Middleware
 * Validates requests from other microservices using a shared API key.
 */
const internalAuth = (req, res, next) => {
  const apiKey = req.headers['x-internal-api-key'];
  const expectedKey = process.env.INTERNAL_API_KEY;

  if (!expectedKey) {
    console.error('INTERNAL_API_KEY not configured on this service');
    return res.status(500).json({ message: 'Internal authentication not configured' });
  }

  if (!apiKey || apiKey !== expectedKey) {
    return res.status(403).json({ message: 'Forbidden: invalid internal API key' });
  }

  next();
};

module.exports = { internalAuth };
