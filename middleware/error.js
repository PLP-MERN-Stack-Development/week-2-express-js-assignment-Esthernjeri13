const { 
  NotFoundError, 
  ValidationError, 
  UnauthorizedError 
} = require('../utils/errors');

module.exports = (err, req, res, next) => {
  console.error(err.stack);
  
  let status = 500;
  let message = 'Internal Server Error';
  
  if (err instanceof NotFoundError) status = 404;
  else if (err instanceof ValidationError) status = 400;
  else if (err instanceof UnauthorizedError) status = 401;
  
  if (status !== 500) message = err.message;
  
  res.status(status).json({ 
    error: {
      status,
      message,
      timestamp: new Date().toISOString() 
    } 
  });
};