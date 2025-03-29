const audioInputEl = document.querySelector('#audio-input');
const audioOutputEl = document.querySelector('#audio-output');
const videoInputEl = document.querySelector('#video-input');

const getDevices = async() => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log("媒體設備", devices);
    devices.forEach(device => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.innerText = device.label;
      if (device.kind === 'audioinput') {
        audioInputEl.appendChild(option);
      }
      else if (device.kind === 'audiooutput') {
        audioOutputEl.appendChild(option);
      }
      else if (device.kind === 'videoinput') {
        videoInputEl.appendChild(option);
      }
    });
  }
  catch(err) {
    console.log(err);
    throw new Error(err);
  }
};

const changeAudioInput = async(e) => {
  const deviceId = e.target.value;
  const newConstraints = {
    audio: {
      deviceId: { exact: deviceId }
    },
    video: true 
  }; 
  try {
    stream = await navigator.mediaDevices.getUserMedia(newConstraints);
    const tracks = stream.getAudioTracks();
    console.log('tracks', tracks);
  }
  catch(err) {
    console.log(err);
    throw new Error(err);
  }
};

const changeAudioOutput = async(e) => {
  try {
    /*
      的主要功能是更改音頻元素的輸出設備。
      例如，如果你有多個音頻輸出設備（如內建揚聲器和外接耳機），
      你可以使用 setSinkId 將音頻輸出到指定的設備。
    */
    await videoEl.setSinkId(e.target.value);
    console.log('Output device set to ' + e.target.value);
  } catch(err) {
    console.log(err);
    throw new Error(err);
  }
};

const changeVideoInput = async(e) => {
  const deviceId = e.target.value;
  const newConstraints = {
    audio: true,
    video: {
      deviceId: { exact: deviceId }
    }, 
  }; 
  try {
    stream = await navigator.mediaDevices.getUserMedia(newConstraints);
    const tracks = stream.getVideoTracks();
    console.log('tracks', tracks);
  }
  catch(err) {
    console.log(err);
    throw new Error(err);
  }
};

getDevices();