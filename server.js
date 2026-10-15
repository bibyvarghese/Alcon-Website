const express = require('express');
const fs = require('node:fs/promises');
const path = require('path');
const dns = require('node:dns').promises;
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = 3000;
const cataloguePath = path.join(__dirname, 'catalogue.pdf');
const downloadRequestsByIp = new Map();

const validDnsDomain = domain =>
  typeof domain === 'string' &&
  domain.length <= 253 &&
  domain.split('.').length >= 2 &&
  domain.split('.').every(label =>
    label.length > 0 &&
    label.length <= 63 &&
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)
  );

const isMissingDnsRecord = error =>
  ['ENODATA', 'ENOTFOUND', 'EAI_NODATA'].includes(error.code);

const hasMailDns = async domain => {
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (mxRecords.some(record => record.exchange !== '.'))
      return true;
    if (mxRecords.length > 0)
      return false;
  } catch (error) {
    if (error.code === 'ENOTFOUND')
      return false;
    if (!isMissingDnsRecord(error))
      throw error;
  }

  const addressResults = await Promise.allSettled([
    dns.resolve4(domain),
    dns.resolve6(domain)
  ]);

  if (addressResults.some(result =>
    result.status === 'fulfilled' && result.value.length > 0
  ))
    return true;

  const lookupError = addressResults.find(result =>
    result.status === 'rejected' && !isMissingDnsRecord(result.reason)
  );
  if (lookupError)
    throw lookupError.reason;

  return false;
};

app.post('/api/email-domain-check', express.json({ limit: '1kb' }), async (req, res) => {
  const domain = typeof req.body?.domain === 'string'
    ? req.body.domain.trim().toLowerCase()
    : '';

  if (!validDnsDomain(domain))
    return res.status(400).json({ message: 'Enter a valid email domain.' });

  try {
    const valid = await hasMailDns(domain);
    return res.json({ valid });
  } catch (error) {
    console.error(`Email domain DNS lookup failed for ${domain}:`, error);
    return res.status(503).json({
      message: 'Email domain DNS could not be checked right now. Please try again.'
    });
  }
});

app.post('/api/catalogue-download', express.json({ limit: '8kb' }), async (req, res) => {
  const ip = req.ip;
  const now = Date.now();
  const recentRequests = (downloadRequestsByIp.get(ip) || [])
    .filter(timestamp => now - timestamp < 10 * 60 * 1000);

  if (recentRequests.length >= 5) {
    downloadRequestsByIp.set(ip, recentRequests);
    return res.status(429).json({
      message: 'Too many catalogue downloads. Please wait a few minutes and try again.'
    });
  }

  const { name, email, phone, company, consent } = req.body || {};
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim() : '';
  const cleanPhone = typeof phone === 'string' ? phone.trim() : '';
  const cleanCompany = typeof company === 'string' ? company.trim() : '';
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneDigits = cleanPhone.replace(/\D/g, '');
  const emailDomain = cleanEmail.slice(cleanEmail.lastIndexOf('@') + 1).toLowerCase();
  const isPlaceholderPhone = /^(\d)\1+$/.test(phoneDigits);

  if (!consent || !cleanName || cleanName.length > 120
    || !emailPattern.test(cleanEmail) || cleanEmail.length > 254
    || !validDnsDomain(emailDomain)
    || !/^\+[0-9().\s-]+$/.test(cleanPhone)
    || phoneDigits.length < 7 || phoneDigits.length > 15 || isPlaceholderPhone
    || cleanCompany.length > 160) {
    return res.status(400).json({
      message: 'Please complete the form and agree to share your details with Alcon Sales.'
    });
  }

  recentRequests.push(now);
  downloadRequestsByIp.set(ip, recentRequests);

  try {
    if (!await hasMailDns(emailDomain))
      return res.status(400).json({
        message: 'This email domain has no mail-routing DNS records. Check the email address and try again.'
      });
  } catch (error) {
    console.error(`Catalogue email domain DNS lookup failed for ${emailDomain}:`, error);
    return res.status(503).json({
      message: 'Email domain DNS could not be checked right now. Please try again.'
    });
  }

  try {
    await fs.access(cataloguePath);
  } catch (error) {
    if (error.code === 'ENOENT')
      return res.status(404).json({ message: 'The catalogue PDF is not available yet.' });
    console.error('Catalogue file check failed:', error);
    return res.status(500).json({ message: 'The catalogue could not be prepared. Please try again.' });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  const smtpPort = Number(SMTP_PORT);
  if (!SMTP_HOST || !Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535
    || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    return res.status(503).json({
      message: 'Sales email delivery is not configured. Please contact sales@alcon.ae.'
    });
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: smtpPort,
    secure: process.env.SMTP_SECURE === 'true' || smtpPort === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: 'sales@alcon.ae',
      replyTo: cleanEmail,
      subject: 'Product catalogue download request',
      text: [
        'A visitor downloaded the Alcon product catalogue.',
        '',
        `Name: ${cleanName}`,
        `Email: ${cleanEmail}`,
        `Phone: ${cleanPhone}`,
        `Company: ${cleanCompany || 'Not provided'}`
      ].join('\n')
    });
  } catch (error) {
    console.error('Catalogue download notification email failed:', error);
    return res.status(502).json({
      message: 'We could not notify Alcon Sales, so the catalogue was not downloaded. Please try again later.'
    });
  }

  return res.download(cataloguePath, 'Alcon-Product-Catalogue.pdf', error => {
    if (error && !res.headersSent) {
      console.error('Catalogue download failed after sales notification:', error);
      res.status(500).json({ message: 'Sales was notified, but the catalogue could not be downloaded.' });
    }
  });
});

app.get('/catalogue.pdf', (req, res) =>
  res.status(404).send('Please use the catalogue request form to download this file.')
);

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
