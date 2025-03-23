const http = require('http');
const app = require('./app');
const { injectSpeedInsightsMiddleware } = require('@vercel/speed-insights/middleware'); // Use the middleware
const port = process.env.PORT || 3000;

const server = http.createServer(app);

// Inject the middleware for automatic tracking
injectSpeedInsightsMiddleware(app);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
