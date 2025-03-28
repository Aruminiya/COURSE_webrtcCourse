const getDevices = async() => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log(devices);
    return devices;
  }
  catch(err) {
    console.log(err);
    throw new Error(err);
  }
};

const changeAudioInput = async(e) => {
  console.log('changeAudioInput');
};

const changeAudioOutput = async(e) => {
  console.log('changeAudioOutput');
};

const changeVideoInput = async() => {
  console.log('changeVideoInput');
};

getDevices();