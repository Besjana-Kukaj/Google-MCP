#!/usr/bin/env node

/**
 * Simple OAuth callback server for Google MCP Server
 * This server handles the OAuth 2.0 redirect and displays the authorization code
 */

import * as http from 'http';
import * as url from 'url';

const PORT = 3000;

// HTML escape function to prevent XSS
function escapeHtml(str = '') {
  return str
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url || '', true);

  if (parsedUrl.pathname === '/auth/callback') {
    const { code, error } = parsedUrl.query;

    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>Authentication Error</title></head>
          <body>
            <h1>Authentication Error</h1>
            <p>Error: ${escapeHtml(error as string)}</p>
            <p>You can close this window and try again.</p>
          </body>
        </html>
      `);
      return;
    }

    if (code) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>Authentication Success</title></head>
          <body>
            <h1>Authentication Successful!</h1>
            <p>Copy this authorization code:</p>
            <div style="background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 14px; word-break: break-all; margin: 10px 0;">
              ${escapeHtml(code as string)}
            </div>
            <p>Use this code with the <code>oauth_complete</code> tool in your MCP server.</p>
            <p>You can close this window now.</p>
            <script>
              // Auto-select the code for easy copying
              document.addEventListener('DOMContentLoaded', function() {
                const codeDiv = document.querySelector('div');
                if (codeDiv) {
                  const range = document.createRange();
                  range.selectNode(codeDiv);
                  window.getSelection().removeAllRanges();
                  window.getSelection().addRange(range);
                }
              });
            </script>
          </body>
        </html>
      `);
    } else {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>Authentication Error</title></head>
          <body>
            <h1>Authentication Error</h1>
            <p>No authorization code received.</p>
            <p>You can close this window and try again.</p>
          </body>
        </html>
      `);
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head><title>Not Found</title></head>
        <body>
          <h1>404 - Not Found</h1>
          <p>This is the OAuth callback server for Google MCP Server.</p>
          <p>The correct callback URL is: <code>http://localhost:3000/auth/callback</code></p>
        </body>
      </html>
    `);
  }
});

server.listen(PORT, () => {
  console.log(`OAuth callback server running on http://localhost:${PORT}`);
  console.log(`Callback URL: http://localhost:${PORT}/auth/callback`);
  console.log('Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down OAuth callback server...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});
