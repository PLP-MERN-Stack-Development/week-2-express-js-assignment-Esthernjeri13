const { API_KEY } = require('../config/constants');
const { UnauthorizedError } = require('../utils/errors');

module.exports = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    throw new UnauthorizedError('API key is required');
  }
  
  if (apiKey !== API_KEY) {
    throw new UnauthorizedError('Invalid API key');
  }
  
  next();
};