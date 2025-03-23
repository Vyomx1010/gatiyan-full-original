const http = require('http');
const app = require('./app');
const { report } = require('@vercel/speed-insights');
const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const start = Date.now();
  
  // Pass the request to the Express app
  app(req, res, () => {});

  // Once the response has finished, measure the duration and report it
  res.on('finish', () => {
    const duration = Date.now() - start;
    report({
      name: `${req.method} ${req.url}`,
      duration,
    });
    console.log(`[⏱️] ${req.method} ${req.url} - ${duration}ms`);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
