const localVideoEl = document.querySelector('#local-video');
const remoteVideoEl = document.querySelector('#remote-video');

let localStream;
let remoteStream;
let peerConnection;

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
    console.log(offer);
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

    peerConnection.addEventListener('icecandidate', e => {
      console.log('ICE candidate:', e);
    })
    resolve();
  })
}

document.querySelector('#call').addEventListener('click',call);