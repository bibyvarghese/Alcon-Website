const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(__dirname));

app.use((req, res) => {
  const requested = (req.originalUrl || req.url || '').toLowerCase();

  if (
    requested.includes('.html/') ||
    requested.includes('/index.html') ||
    requested.includes('/index') ||
    requested.includes('/.git') ||
    requested.includes('/.env') ||
    requested.includes('/admin') ||
    requested.includes('/wp-admin') ||
    requested.includes('/phpmyadmin') ||
    requested.includes('/cgi-bin')
  ) {
    return res.status(404).sendFile(path.join(__dirname, '404.html'));
  }

  return res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(port, () => {
  console.log(`Local site running at http://localhost:${port}`);
});
