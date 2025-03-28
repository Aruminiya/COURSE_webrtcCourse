let mediaRecorder
let recordedBlobs

const startRecording = () => {
  if (!stream) {
    alert('No stream found, please get user media first');
    return;
  }
  console.log('startRecording', stream);
  recordedBlobs = []; // 用來存放錄製的二進制媒體數據
  mediaRecorder = new MediaRecorder(stream);
  // ondataavailable 是 MediaRecorder 物件的一個事件處理器 (event handler)。
  // 當 MediaRecorder 收集到一段錄製的媒體數據時，會觸發 dataavailable 事件，而 ondataavailable 就是用來處理這個事件的函數。
  mediaRecorder.ondataavailable = (e) => { 
    console.log('媒體錄製的資料', e.data);
    recordedBlobs.push(e.data);
  };
  mediaRecorder.start();
  changeButtons([
    'green', 'green', 'blue', 'blue', 'green', 'blue', 'grey', 'blue'
  ]);
};

const stopRecording = () => {
  if (!mediaRecorder) {
    alert('No mediaRecorder found, please start recording first');
    return;
  }
  console.log('stopRecording');
  mediaRecorder.stop();
  changeButtons([
    'green', 'green', 'blue', 'blue', 'green', 'green', 'blue', 'blue'
  ]);
};

const playRecording = () => {
  if (!recordedBlobs) {
    alert('No recordedBlobs found, please start recording first');
    return;
  }
  console.log('playRecording');
  // 如果你直接寫成 const superBuffer = recordedBlobs;，
  // 那麼 superBuffer 只是指向 recordedBlobs 陣列的引用，並不會將這些片段合併成一個完整的二進制對象。
  // 這樣的數據結構無法直接用於某些需要單一 Blob 的操作
  const superBuffer = new Blob(recordedBlobs);
  const recordedVideoEl = document.querySelector('#other-video');
  recordedVideoEl.src = window.URL.createObjectURL(superBuffer);
  recordedVideoEl.controls = true;
  recordedVideoEl.play();
  changeButtons([
    'green', 'green', 'blue', 'blue', 'green', 'green', 'green', 'blue'
  ]);
};