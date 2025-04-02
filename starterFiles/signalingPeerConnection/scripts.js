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
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });
  localVideoEl.srcObject = stream;
  localStream = stream;

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
    peerConnection.setLocalDescription(offer);
    socket.emit('newOffer', offer); // 發送 offer 給遠端
    console.log('Offer sent to remote peer');
  } catch (err) {
    console.error(err);
  }
}

const createPeerConnection = () => {
  return new Promise(async (resolve, reject) => {
  /*
    創建RTCPeerConnection實例, 這裡使用了STUN伺服器來獲取公共IP地址
    你可以根據需要添加TURN伺服器, 以便在NAT環境中進行P2P連接
    這裡使用了Google的STUN伺服器, 你也可以使用自己的STUN伺服器
  */
    peerConnection = await new RTCPeerConnection(peerConfiguration);

    localStream.getTracks().forEach(track => {
      /*
        將本地媒體流中的每個音頻和視頻軌道添加到RTCPeerConnection實例中
        這樣就可以將本地媒體流傳輸到遠程端
      */
      peerConnection.addTrack(track, localStream);
    })
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
      if (peerConnection.iceConnectionState === 'connected' || peerConnection.iceConnectionState === 'completed') {
        console.log('WebRTC connected');
      }
    })
    resolve();
  })
}

document.querySelector('#call').addEventListener('click',call);