const userName = "Rob-"+Math.floor(Math.random()*100000);
const password = "x";
document.querySelector('#user-name').innerHTML = userName;

const socket = io('https://localhost:8081', {
  auth: {
    userName,
    password
  }
});

const localVideoEl = document.querySelector('#local-video');
const remoteVideoEl = document.querySelector('#remote-video');

let localStream;
let remoteStream;
let peerConnection;
let didIOffer = false;

let peerConfiguration = {
  iceServers:[
      {
          urls:[
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302'
          ]
      }
  ]
}

// 當用戶點擊開始按鈕時，請求訪問攝像頭和麥克風
const call = async e=>{

  // 獲取使用者媒體流
  await fetchUserMedia();

  // peerConnection 已經準備好，並且我們的 STUN servers 已經傳遞過去
  await createPeerConnection();

  // create Offer
  try {
    console.log('Creating offer...');
    /*
      createOffer 生成一個描述本地端媒體能力（如音頻、視頻編解碼器等）和連接參數的 SDP。
      這個 SDP 是用於開始 WebRTC 連接的第一步。
    */
    const offer = await peerConnection.createOffer();
    didIOffer = true;
    console.log(offer);

    /*
      setLocalDescription 的核心作用：
      設置本地端的 SDP 描述。
      觸發 ICE 候選者的收集。
      為信令交換做好準備。
      它是 WebRTC 連接建立過程中的一個關鍵步驟，與 createOffer 或 createAnswer 配合使用。
    */
    peerConnection.setLocalDescription(offer); // 這是 CLIENT1，CLIENT1 將 offer 作為本地描述
    socket.emit('newOffer', offer); // 發送 offer 給遠端
    console.log('Offer sent to remote peer');
  } catch (err) {
    console.error(err);
  }
}

const answerOffer = async (offerObj)=>{
  await fetchUserMedia();
  await createPeerConnection(offerObj);
  const answer = await peerConnection.createAnswer({});
  await peerConnection.setLocalDescription(answer); // 這是 CLIENT2，CLIENT2 將 offer 作為本地描述
  // console.log(peerConnection.signalingState) // should be have-local-pranswer, because client2 has setLocalDescription to it's answer (but it won't be)
  // console.log('offerObj', offerObj);
  // console.log('answer', answer);

  // 將 answer 添加到 offerObj 中，以便伺服器知道這個 answer 與哪個 offer 相關
  offerObj.answer = answer; // 將 answer 添加到 offerObj 中
  // 將 answer 發送給信令伺服器，以便它可以傳送給 CLIENT1
  // 預期伺服器回應已存在的 ICE 候選者
  
  /*
    emitWithAck

    是一種方法，通常與 WebSocket 通信庫（例如 Socket.IO）一起使用，用於發送事件並等待伺服器的確認（acknowledgment）。它是一個基於 Promise 的方法，允許你在發送事件後處理伺服器的回應。

    在 Socket.IO 中，emitWithAck 是一個變體，類似於 socket.emit，但它會返回一個 Promise，這樣你可以使用 await 或 .then() 來處理伺服器的回應。

    如何運作
    發送事件：你向伺服器發送一個事件（例如 'newAnswer'），並附帶一些數據（如 offerObj）。
    等待伺服器回應：伺服器處理該事件後，會回傳一個確認或數據。
    處理回應：你可以在 Promise resolve 時處理伺服器的回應。
  */
  const offerIceCandidates = await socket.emitWithAck('newAnswer', offerObj);
  offerIceCandidates.forEach(c => {
    // 將 ICE 候選者添加到 peerConnection 中
    peerConnection.addIceCandidate(c);
    console.log('======Added ICE candidate======');
  })
  console.log('offerIceCandidates', offerIceCandidates);
}

const addAnswer = async (offerObj) => {
  // addAnswer 在 socketListeners.js 中被呼叫，當 answerResponse 被觸發時
  // 此時，offerObj 已經在 CLIENT1 和 CLIENT2 之間交換完成
  // 現在 CLIENT1 需要設定遠端描述
  await peerConnection.setRemoteDescription(offerObj.answer);
  // console.log(peerConnection.signalingState) // 應該是 stable，因為 CLIENT1 已經對 answer 呼叫了 setRemoteDescription;
};

const fetchUserMedia = () => {
  return new Promise(async (resolve, reject) => {
    try {
      /*
        獲取使用者媒體流
        這裡使用了 getUserMedia API 獲取本地媒體流
        這個媒體流將用於顯示本地視頻和音頻
      */
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      localVideoEl.srcObject = stream;
      localStream = stream;
      resolve();
    } catch (err) {
      console.error(err);
      reject(err);
    }
  })
}

const createPeerConnection = (offerObj) => {
  return new Promise(async (resolve, reject) => {
  /*
    創建RTCPeerConnection實例, 這裡使用了STUN伺服器來獲取公共IP地址
    你可以根據需要添加TURN伺服器, 以便在NAT環境中進行P2P連接
    這裡使用了Google的STUN伺服器, 你也可以使用自己的STUN伺服器
  */
    peerConnection = await new RTCPeerConnection(peerConfiguration);
    remoteStream = new MediaStream();
    remoteVideoEl.srcObject = remoteStream;

    localStream.getTracks().forEach(track => {
      /*
        將本地媒體流中的每個音頻和視頻軌道添加到RTCPeerConnection實例中
        這樣就可以將本地媒體流傳輸到遠程端
      */
      peerConnection.addTrack(track, localStream);
    })

    peerConnection.addEventListener("signalingstatechange", (e) => {
      console.log('........Signaling state change........');
      console.log(e);
      console.log(peerConnection.signalingState);
    });


    /* 
      icecandidate 會查看候選者 
      WebRTC 會收集多個候選者，然後通過 ICE 協商選擇最佳路徑（例如，P2P 直連或通過 TURN 中繼）。
      最終使用的 IP 地址是通過 ICE 協商確定的，並不一定是第一個打印出來的候選者。
    */
    peerConnection.addEventListener('icecandidate', e => {
      console.log('........ICE candidate........');
      console.log(e);
      if (e.candidate) {
        socket.emit('sendIceCandidateToSignalingServer', {
          iceCandidate: e.candidate,
          iceUserName: userName,
          didIOffer
        });
      }
    })
    /*
      如果你想查看 WebRTC 最終使用的 IP 地址，可以監聽 iceconnectionstatechange 事件，
      並檢查連接狀態是否變為 connected 或 completed。此時，WebRTC 已經選擇了最終的候選者。
    */
    peerConnection.addEventListener('iceconnectionstatechange', e => {
      console.log('........ICE connection state change........');
      console.log(e);
      console.log(peerConnection.iceConnectionState);
      if (peerConnection.iceConnectionState === 'connected' || peerConnection.iceConnectionState === 'completed') {
        console.log('WebRTC connected');
      }
    })

    peerConnection.addEventListener('track', e => {
      console.log('Got a track from the other peer !! How cool is that !!');
      console.log(e);
      e.streams[0].getTracks().forEach(track => {
        console.log(track);
        remoteStream.addTrack(track, remoteStream);
        console.log('Here is a exciting track from the other peer !!');
      })
    })

    if (offerObj) {
      // 當從 call() 呼叫時，這裡的條件不會成立
      // 而是 answerOffer() 呼叫時成立
      console.log(peerConnection.signalingState) // should be stable because no setDesc has been run yet
      await peerConnection.setRemoteDescription(offerObj.offer); // 這是 CLIENT2，CLIENT2 將 offer 作為遠端描述
      console.log(peerConnection.signalingState) // should be have-remote-offer, because client2 has setRemoteDescription on the offer
    }
    resolve();
  })
}

const addNewIceCandidate = (iceCandidate) => {
  // 將 ICE 候選者添加到 peerConnection 中
  peerConnection.addIceCandidate(iceCandidate);
  console.log('======Added ICE candidate======');
}

document.querySelector('#call').addEventListener('click',call);