const videoEl = document.querySelector('#my-video');
let stream = null; // Initialize stream to null
let mediaStream = null; // Initialize mediaStream to null for screenShare

const constraints = {
  audio: true, // user's microphone, if available
  video: { width: 1280, height: 720 } // user's webcam
};

const getMicAndCamera = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log('Got MediaStream:', stream);
    changeButtons([
      'green', 'blue', 'blue', 'grey', 'grey', 'grey', 'grey', 'grey'
    ]);
  }
  catch (err) {
    console.error(err);
  }
};

const showMyFeed = () => {
  console.log('showMyFeed is working');
  if (!stream) {
    alert('Stream still loading...');
    return;
  }
  videoEl.srcObject = stream;
  const tracks = stream.getTracks();
  console.log('Got MediaStreamTracks:', tracks);
  changeButtons([
    'green', 'green', 'blue', 'blue', 'blue', 'grey', 'grey', 'blue'
  ]);
};

const stopMyFeed = () => {
  const tracks = stream.getTracks();
  tracks.forEach(track => track.stop());
  stream = null;
  changeButtons([
    'blue', 'grey', 'grey', 'grey', 'grey', 'grey', 'grey', 'grey'
  ]);
};

const changeSize = () => {
  const width = document.querySelector('#vid-width').value;
  const height = document.querySelector('#vid-height').value;
  changeVideoSize(width, height);
};

document.querySelector('#share').addEventListener('click', getMicAndCamera);
document.querySelector('#show-video').addEventListener('click', showMyFeed);
document.querySelector('#stop-video').addEventListener('click', stopMyFeed);
document.querySelector('#change-size').addEventListener('click', changeSize);
document.querySelector('#start-record').addEventListener('click', startRecording);
document.querySelector('#stop-record').addEventListener('click', stopRecording);
document.querySelector('#play-record').addEventListener('click', playRecording);
document.querySelector('#share-screen').addEventListener('click', shareScreen);