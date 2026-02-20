/**
 * cPanel / Passenger entry point for a Next.js standalone build.
 *
 * `next build` with output:'standalone' generates .next/standalone/server.js
 * which is a fully self-contained HTTP server. We just delegate to it here
 * so cPanel's Passenger always has a fixed startup file at the project root.
 *
 * Passenger sets the PORT environment variable automatically.
 */
require('./.next/standalone/server.js');
