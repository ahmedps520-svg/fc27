/**
 * Entry point for local play.
 *
 * This used to be a static file server. It now hands straight over to the real
 * server, which additionally provides accounts, cloud saves and online matches —
 * so there is still only one thing to run:
 *
 *   node .dev-server.js [port]
 */
require('./server/server.js');
