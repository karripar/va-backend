import rateLimit from 'express-rate-limit';

// limiter for sending contact messages
export const contactMessageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    message: 'Too many contact messages sent from this IP, please try again after an hour',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
