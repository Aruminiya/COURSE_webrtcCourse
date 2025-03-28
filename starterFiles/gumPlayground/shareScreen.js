const shareScreen = async(e)=>{ 
  console.log("shareScreen");
  const option = {
    video: true,
    audio: true,
    surfaceSwitching: 'include' // include/exclude // 用於控制在螢幕共享時是否允許用戶在共享過程中切換共享的表面（例如從共享一個窗口切換到共享整個螢幕或其他窗口）
  }
  try{
    const mediaDevices = await navigator.mediaDevices.getDisplayMedia(option);
    console.log(mediaDevices);
    changeButtons([
      'green','green','blue','blue','green','green','green','green'
    ]);
  }
  catch(err){
    console.log("user denied access to constraints");
    console.log(err);
  }
}