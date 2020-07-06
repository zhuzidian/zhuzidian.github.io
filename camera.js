window.onload = function () {
  if (!navigator.mediaDevices) {
    // console.log("navigator.mediaDevices not supported.");
    errors.innerHTML += `<p>navigator.mediaDevices not supported</p>`
    return;
  }
  if (!MediaRecorder) {
    errors.innerHTML += `<p>MediaRecorder not supported</p>`
    return;
  }

  const errors = document.getElementById('errors')

  const camera_video = document.getElementById("camera_video");
  const playback_video = document.getElementById('playback_video');
  const downloadlink = document.getElementById('downloadlink')

  const record_start = document.getElementById("rec_start");
  const record_stop = document.getElementById("rec_stop");

  // カメラ設定
  var constraints = {
    audio: false,
    video: {
      aspectRatio: 300 / 200,
      facingMode: "user"   // フロントカメラ
      // facingMode: { exact: "environment" }  // バックカメラ
    },
  };
  // カメラの内容を<vedio>に映る
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((mediastream) => {
      camera_video.srcObject = mediastream
      camera_video.onloadedmetadata = (e) => {
        camera_video.play()
      }

      const mediaRecorder = new MediaRecorder(mediastream)

      record_start.onclick = () => {
        mediaRecorder.start()
        console.log("recorder start", mediaRecorder.state)
        errors.innerHTML += `<p>recorder start</p>`
      }

      record_stop.onclick = () => {
        mediaRecorder.stop()
        console.log("recorder stop", mediaRecorder.state)
        errors.innerHTML += `<p>recorder stop</p>`
      }

      mediaRecorder.ondataavailable = (e) => {
        console.log('e.data.type', e.data.type)
        errors.innerHTML += `<p>${e.data.type}</p>`
          
        const blob = new Blob([e.data], { type: e.data.type })
        const bloburl = URL.createObjectURL(blob)
        playback_video.src = bloburl

        downloadlink.download = 'record.mp4'
        downloadlink.href = bloburl
      }
    })
    .catch(function (err) {
      console.log(err.name + ": " + err.message)
      errors.innerHTML += `<p>${err.name}: ${err.message}</p>`
    })

  // const photo_canvas = document.getElementById("photo");
  // const shutter = document.getElementById("shutter");
  // shutter.onclick = (e) => {
  //   const ctx = photo_canvas.getContext("2d")
  //   ctx.drawImage(camera_video, 0, 0, photo_canvas.width, photo_canvas.height)
  // };
};
