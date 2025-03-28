const supportedConstrants = navigator.mediaDevices.getSupportedConstraints();  // Web API 中的一個方法，用於檢查當前設備支持的媒體約束（constraints）。
console.log(supportedConstrants);  // {aspectRatio: true, autoGainControl: true, channelCount: true, deviceId: true, echoCancellation: true, ...}

const changeVideoSize = (width, height) => {
  if (!width || !height) return console.error('Please provide width and height');
  stream.getVideoTracks().forEach(track => { // stream.getVideoTracks() 返回一個包含所有視頻輸入或輸出的 MediaStreamTrack 物件的陣列。
    // track 是 video 的 track
    // 我們可以透過 getCapabilities() 這個方法 得到這個 track 的能力數值
    // 這裡我們要改變 video 的大小，所以我們要改變的是 width 和 height
    const vCapabilies = track.getCapabilities(); // track.getCapabilities() 這個方法可以得到 track 的能力數值
    if (width > vCapabilies.width.max) console.warn('Width is too large, Your device can only support width up to ' + vCapabilies.width.max);
    if (height > vCapabilies.height.max) console.warn('Height is too large, Your device can only support height up to ' + vCapabilies.height.max);
    const vConstrants = {
        width: width > vCapabilies.width.max ? vCapabilies.width.max : width,
        height: height > vCapabilies.height.max ? vCapabilies.height.max : height,
        // framRate: 5
        // aspectRatio: 16 / 9
    }
    track.applyConstraints(vConstrants); // track.applyConstraints() 這個方法可以改變 track 的能力數值
  });
};