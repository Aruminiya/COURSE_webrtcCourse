/*
  我們需要在 localhost 的上下文中運行這個程序，而不是直接從文件運行，
  這樣我們才能使用 enumerate devices（ 它必須在 secure context 中運行 ），
  而 localhost 被認為是一個安全的上下文。
*/

/*
  Secure Context（安全上下文） 是指一個網頁或腳本運行在安全的環境中。這樣的環境可以保證數據的傳輸是加密的，從而防止中間人攻擊和其他安全威脅。

  判定為 Secure Context 的條件
  HTTPS:
  網頁必須通過 HTTPS 協議加載，因為 HTTPS 提供了加密的通信通道。
  localhost:
  localhost 被認為是安全的，即使它沒有使用 HTTPS，因為它只在本地運行，不會暴露在網絡上。
  文件系統的安全性:
  某些情況下，從  協議加載的文件可能不被認為是安全的，因為它們缺乏加密保護。
*/

const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();
const socketIo = require('socket.io');
const path = require('path');
const port = 8081; // Port number

app.use(express.static(path.join(__dirname)));

/*
  我們需要 mkcert 來生成 ssl key 和 cert
  這樣我們就可以在 localhost 上運行 https server
  注意：這個 cert 和 key 只能在 localhost 上使用，
  你不能把它們放到生產環境中使用
*/ 
/*
  $ mkcert creat-ca
  $ mkcert creat-cert
*/ 
const key = fs.readFileSync('cert.key');
const cert = fs.readFileSync('cert.crt');
/*
  這行代碼的作用是讓 Express 將當前文件所在的目錄（__dirname）作為靜態文件的根目錄，
  從而允許客戶端直接訪問該目錄中的文件。
  例如，如果目錄中有一個文件 index.html，
  那麼客戶端可以通過 http://localhost:3000/index.html 訪問它。
*/

// 我們改變了 express sever，讓它可以在 https 上運行
const expressServer = https.createServer(
  {
    key, // SSL key
    cert, // SSL certificate
  },
  app
);
const io = socketIo(expressServer, {});

expressServer.listen(port, () => {
  console.log(`Example app listening at https://localhost:${port}`);
});

io.on('connection', (socket) => {
  console.log('A user connected');
});