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

const express = require('express');
const app = express();
const path = require('path');
const port = 3000; // Port number

app.use(express.static(path.join(__dirname)));
/*
  這行代碼的作用是讓 Express 將當前文件所在的目錄（__dirname）作為靜態文件的根目錄，
  從而允許客戶端直接訪問該目錄中的文件。
  例如，如果目錄中有一個文件 index.html，
  那麼客戶端可以通過 http://localhost:3000/index.html 訪問它。
*/

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});