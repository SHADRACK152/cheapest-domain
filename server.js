/**
 * cPanel / Passenger entry point for a Next.js standalone build.
 *
 * To ensure the standalone server resolves its internal paths (for
 * static assets) correctly we switch the process working directory into
 * the generated standalone folder and then require its `server.js`.
 *
 * Passenger sets the PORT environment variable automatically.
 */
const path = require('path');
const standaloneDir = path.join(__dirname, '.next', 'standalone');

try {
	process.chdir(standaloneDir);
} catch (err) {
	// If chdir fails, fall back to requiring by absolute path.
	// This keeps behavior robust in different host environments.
	require(path.join(standaloneDir, 'server.js'));
	return;
}

// When cwd is the standalone dir we can require the local server directly.
require('./server.js');
