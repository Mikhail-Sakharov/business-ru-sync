import http from 'http';

const host = process.env.HOST;
const port = Number(process.env.PORT);

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!!!\n');
  console.log('Hello!');
});

server.listen(port, host, () => {
  console.log(`Server started on ${host}:${port}`);
});
