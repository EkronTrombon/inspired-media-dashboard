/**
 * One-time script to authorize Gmail access and get a refresh token.
 *
 * Usage:
 *   GOOGLE_CLIENT_ID=<id> GOOGLE_CLIENT_SECRET=<secret> node scripts/get-gmail-token.mjs
 *
 * On Windows (PowerShell):
 *   $env:GOOGLE_CLIENT_ID="<id>"; $env:GOOGLE_CLIENT_SECRET="<secret>"; node scripts/get-gmail-token.mjs
 */

import { createServer } from "http";
import { google } from "googleapis";
import { exec } from "child_process";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const PORT = 3001;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.send",
];

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "\n❌ Missing credentials.\n\nRun with:\n" +
      '  $env:GOOGLE_CLIENT_ID="<id>"; $env:GOOGLE_CLIENT_SECRET="<secret>"; node scripts/get-gmail-token.mjs\n'
  );
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
  prompt: "consent", // ensures a refresh_token is always returned
});

// Try to open the browser automatically on Windows
exec(`start "" "${authUrl}"`, (err) => {
  if (err) {
    // Non-fatal — user can open manually
  }
});

console.log("\n🔐 Opening browser for Gmail authorization...");
console.log("If the browser doesn't open, paste this URL manually:\n");
console.log(authUrl);
console.log("\n⏳ Waiting for authorization...\n");

const server = createServer(async (req, res) => {
  if (!req.url?.startsWith("/callback")) return;

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    res.end(`<html><body><h2>Authorization denied: ${error}</h2></body></html>`);
    console.error(`\n❌ Authorization denied: ${error}\n`);
    server.close();
    return;
  }

  if (!code) {
    res.end("<html><body><h2>No code received.</h2></body></html>");
    server.close();
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    res.end(
      "<html><body><h2>✅ Authorization successful! You can close this tab.</h2></body></html>"
    );

    console.log("✅ Authorization successful!\n");
    console.log("Add these lines to your .env.local file:\n");
    console.log("─────────────────────────────────────────");
    console.log(`GOOGLE_CLIENT_ID=${CLIENT_ID}`);
    console.log(`GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log("─────────────────────────────────────────\n");
  } catch (err) {
    res.end(
      `<html><body><h2>Error: ${err.message}</h2></body></html>`
    );
    console.error("\n❌ Failed to get token:", err.message, "\n");
  }

  server.close();
});

server.listen(PORT, () => {
  // Server is ready, waiting for browser redirect
});
