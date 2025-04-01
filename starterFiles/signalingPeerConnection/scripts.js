const localVideoEl = document.querySelector('#local-video');
const remoteVideoEl = document.querySelector('#remote-video');

let localStream;
let remoteStream;
let peerConnection;

// 當用戶點擊開始按鈕時，請求訪問攝像頭和麥克風
const call = async e=>{
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });
  localVideoEl.srcObject = stream;
  localStream = stream;
}

document.querySelector('#call').addEventListener('click',call);