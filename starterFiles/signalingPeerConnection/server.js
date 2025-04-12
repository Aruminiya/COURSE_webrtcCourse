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

// offers 將包含 {}
const offers = [
  // offererUserName
  // offer
  // offerIceCandidates
  // answererUserName
  // answer
  // answerIceCandidates
];

// connectedSockets 將包含 {}
const connectedSockets = [
  // socketId
  // userName
];

io.on('connection', (socket) => {
  const userName = socket.handshake.auth.userName;
  const password = socket.handshake.auth.password;
  // console.log(`User ${userName} connected`);
  // console.log(`Password: ${password}`);
  // console.log(`Socket ID: ${socket.id}`);

  if (password !== 'x') {
    console.error('Wrong password');
    socket.disconnect(true);
    return;
  }
  
  connectedSockets.push({
    socketId: socket.id,
    userName,
  });

  // 一個新的客戶端已加入。如果有任何可用的 offers，
  // 將它們發送出去
  if(offers.length) {
    socket.emit('availableOffers', offers);
  }

  socket.on('newOffer', (newOffer) => {
    offers.push({
      offererUserName: userName,
      offer: newOffer,
      offerIceCandidates: [],
      answererUserName: null,
      answer: null,
      answerIceCandidates: [],
    });

    // 發送所有已連接 sockets 除了 caller
    socket.broadcast.emit('newOfferAwaiting', offers.slice(-1)); 
    // offers.slice(-1) 的作用是從陣列中提取最後一個元素，並返回一個包含該元素的新陣列。

    console.log('New offer received');
    // console.log(newOffer);
    // console.log(offers);
  });

  socket.on('newAnswer', (offerObj) => {
    // console.log('offerObj', offerObj);
    // 將這個 answer (offerObj) 發送回 CLIENT1
    // 為了做到這一點，我們需要 CLIENT1 的 socketId
    const socketToAnswer = connectedSockets.find(
      s => s.userName === offerObj.offererUserName
    );
    if (!socketToAnswer) {
      console.error('socketToAnswer not found');
      return;
    } 
    // 我們找到了匹配的 socket，因此可以向它發送消息！
    const socketIdToAnswer = socketToAnswer.socketId;
    // 我們找到要更新的 offer，然後可以發送它
    const offerToUpdate = offers.find(
      o => o.offererUserName === offerObj.offererUserName
    );
    if (!offerToUpdate) {
      console.error('offerToUpdate not found');
      return;
    }
    offerToUpdate.answer = offerObj.answer;
    offerToUpdate.answererUserName = userName;
    socket.to(socketIdToAnswer).emit('answerResponse', offerToUpdate);
    /*
      socket.to 是 Socket.IO 中的一個方法，用於向特定的房間（room）或特定的 socket 發送消息，而不是向所有連接的客戶端廣播消息。
      在 Socket.IO 中，客戶端可以加入一個或多個房間（room），這些房間是邏輯分組的方式。socket.to 允許你指定一個房間，然後只向該房間內的客戶端發送消息。
    */
    /*
      socket.to(room).emit(eventName, data) 的結構如下：

      room: 目標房間的名稱。
      emit: 發送事件的方法。
      eventName: 事件名稱，客戶端會監聽這個事件。
      data: 發送的數據。
    */
  });

  socket.on('sendIceCandidateToSignalingServer', (iceCandidateObj) => {
    const { didIOffer, iceUserName, iceCandidate } = iceCandidateObj;
    // console.log('........ICE candidate........');
    // console.log('didIOffer:', didIOffer );
    // console.log('iceUserName:', iceUserName );
    // console.log('iceCandidate:', iceCandidate );
    if (didIOffer) {
      const offerInOffers = offers.find(o => o.offererUserName === iceUserName);
      if (offerInOffers) {
        offerInOffers.offerIceCandidates.push(iceCandidate);
        // TODO come back to this...
        // if answer is already here, send the iceCandidate
      }
    }
    // console.log('offers:', offers);
  });
});