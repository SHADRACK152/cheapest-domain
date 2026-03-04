#!/usr/bin/env node
// scripts/check-truehost.js
// Simple tester for WHMCS-style TrueHost API using env vars.

const { URL } = require('url');
const http = require('http');
const https = require('https');

function postForm(endpoint, params) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(endpoint);
      const body = new URLSearchParams(params).toString();
      const isHttps = url.protocol === 'https:';
      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + (url.search || ''),
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
        },
      };

      const req = (isHttps ? https : http).request(options, (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, statusMessage: res.statusMessage, body: data }));
      });

      req.on('error', (e) => reject(e));
      req.write(body);
      req.end();
    } catch (e) {
      reject(e);
    }
  });
}

(async () => {
  const identifier = process.env.TRUEHOST_IDENTIFIER;
  const secret = process.env.TRUEHOST_SECRET;
  const endpoint = process.env.TRUEHOST_ENDPOINT || 'https://truehost.co.ke/cloud/includes/api.php';
  const domain = process.env.DOMAIN_TO_CHECK || 'example.com';

  if (!identifier || !secret) {
    console.error('Missing TRUEHOST_IDENTIFIER or TRUEHOST_SECRET in environment');
    process.exit(2);
  }

  try {
    const params = {
      identifier,
      secret,
      action: 'DomainCheck',
      responsetype: 'json',
      domain,
    };

    console.log('POST ->', endpoint);
    const res = await postForm(endpoint, params);
    console.log('STATUS', res.statusCode, res.statusMessage);
    const text = res.body || '';
    try {
      const json = JSON.parse(text);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log(text.slice(0, 2000));
    }
  } catch (err) {
    console.error('Request failed:', err.message || err);
    process.exit(1);
  }
})();
