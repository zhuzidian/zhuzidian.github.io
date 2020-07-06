window.onload = () => {
  // console.log('location.hostname', location.hostname)
  // if (location.hostname !== 'localhost') {
  //   var log = document.getElementById('log');
  //   console.log = function (message) {
  //     if (typeof message === 'object') {
  //       log.innerHTML += JSON.stringify(message) + '<br>';
  //     } else {
  //       log.innerHTML += message + '<br>';
  //     }
  //   }
  // }

  if (!navigator.mediaDevices) {
    console.log("navigator.mediaDevices not supported.")
    return
  }
  if (!window.MediaRecorder) {
    console.log("MediaRecorder not supported.")
    return
  }

  const sample_video = document.getElementById('sample_video')
  const sample_play = document.getElementById('sample_play')
  const sample_pause = document.getElementById('sample_pause')
  // sample_video.onloadedmetadata = (event) => {
  //   console.log('sample_video loadedmetadata', event);
  // }
  sample_play.onclick = (e) => {
    sample_video.play()
  }
  sample_pause.onclick = (e) => {
    sample_video.pause()
  }


  const camera_video = document.getElementById('camera_video')
  const playback_video = document.getElementById('playback_video')
  const downloadlink = document.getElementById('downloadlink')

  const record_start = document.getElementById('rec_start')
  const record_stop = document.getElementById('rec_stop')
  const playback_play = document.getElementById('playback_play')
  const playback_pause = document.getElementById('playback_pause')
  playback_play.onclick = () => {
    playback_video.play()
  }
  playback_pause.onclick = () => {
    playback_pause.pause()
  }

  let mixed_video_stream = new MediaStream()

  // カメラ設定
  var constraints = {
    // audio: { echoCancellation: true },
    audio: false,
    video: {
      aspectRatio: 300 / 200,
      facingMode: "user"   // フロントカメラ
      // facingMode: { exact: "environment" }  // バックカメラ
    },
  }
  // カメラの内容を<vedio>に映る
  navigator.mediaDevices.getUserMedia(constraints)
    .then((mediastream) => {
      camera_video.srcObject = mediastream
      camera_video.onloadedmetadata = (e) => {
        camera_video.play()
      }

      // const mediaRecorder = new MediaRecorder(mediastream)
      let mediaRecorder

      record_start.onclick = () => {
        let track1 = mediastream.getVideoTracks()[0]
        console.log('track1', track1)
      
        let track2 = sample_video.captureStream().getVideoTracks()[0]
        console.log('track2', track2)
      
        mixed_video_stream.addTrack(track1)
        mixed_video_stream.addTrack(track2)
        console.log('mixed_video_stream', mixed_video_stream.getVideoTracks());
        
        mediaRecorder = new MediaRecorder(mixed_video_stream)

        mediaRecorder.start()
        console.log("recorder start", mediaRecorder.state)

        mediaRecorder.ondataavailable = (e) => {
          console.log(e)
            
          // const blob = new Blob([e.data], { type: e.data.type })
          const blob = new Blob([e.data], { type: e.data.type })
          const bloburl = URL.createObjectURL(blob)
          playback_video.src = bloburl
  
          downloadlink.download = 'mixed.webm'
          downloadlink.href = bloburl
        }
      }

      record_stop.onclick = () => {
        mediaRecorder.stop()
        sample_video.pause()
        console.log("recorder stop", mediaRecorder)
      }
    })
    .catch(function (err) {
      console.log(err.name + ": " + err.message)
    })

  // const photo_canvas = document.getElementById("photo")
  // const shutter = document.getElementById("shutter")
  // shutter.onclick = (e) => {
  //   const ctx = photo_canvas.getContext("2d")
  //   ctx.drawImage(camera_video, 0, 0, photo_canvas.width, photo_canvas.height)
  // }
}
