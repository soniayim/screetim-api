const http = require('http');
const appStates = {};
const server = http.createServer((req, res) => {
  const urlParts = req.url.split('/');
  if (req.url.startsWith('/api/screentime/toggle/')) {
    const appName = decodeURIComponent(urlParts[urlParts.length - 1]);
    const now = Date.now();
    if (!appStates[appName]) {
      appStates[appName] = { status: 'close', lastTime: now, totalMinutes: 0 };
    }
    const state = appStates[appName];
    if (state.status === 'close') {
      state.status = 'open';
      state.lastTime = now;
    } else {
      state.status = 'close';
      state.totalMinutes += Math.round((now - state.lastTime) / 60000);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, app: appName, status: state.status, totalMinutes: state.totalMinutes }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});
module.exports = server;
