const http = require('http');
const appStates = {};

// 🔐 請在這裡設定你的專屬密碼（可以改成你自己喜歡的英文或數字組合）
const SECRET_TOKEN = "473";

const server = http.createServer((req, res) => {
  const urlParts = req.url.split('/');
  
  // 檢查網址裡有沒有帶正確的密碼
  const token = req.headers['x-secret-token'] || new URL(req.url, 'http://localhost').searchParams.get('token');
  
  if (req.url.startsWith('/api/screentime/toggle/')) {
    // 驗證密碼是否正確
    if (token !== SECRET_TOKEN) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Unauthorized: 權限不足，拒絕存取' }));
      return;
    }

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
