const supportedConstrants = navigator.mediaDevices.getSupportedConstraints();  // Web API 中的一個方法，用於檢查當前設備支持的媒體約束（constraints）。
console.log(supportedConstrants);  // {aspectRatio: true, autoGainControl: true, channelCount: true, deviceId: true, echoCancellation: true, ...}

const changeVideoSize = () => {
  stream.getTracks().forEach(track => { // stream.getTracks() 返回一個包含所有媒體輸入或輸出的 MediaStreamTrack 物件的陣列。 
    console.log(track);
    const capabilities = track.getCapabilities(); // track.getCapabilities() 返回一個包含所有輸入或輸出設備的能力的 MediaTrackCapabilities 物件。
    console.log(capabilities);
  });
};