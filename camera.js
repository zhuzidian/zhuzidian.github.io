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

  main()

  // const sample_video = document.getElementById('sample_video')
  // const sample_play = document.getElementById('sample_play')
  // const sample_pause = document.getElementById('sample_pause')
  // sample_play.onclick = (e) => {
  //   sample_video.muted = false
  //   sample_video.play()
  // }
  // sample_pause.onclick = (e) => {
  //   sample_video.pause()
  // }


  
  
  // const ctx = playback_canvas.getContext('2d')
  // const downloadlink = document.getElementById('downloadlink')

  // const record_start = document.getElementById('rec_start')
  // const record_stop = document.getElementById('rec_stop')
  // const playback_play = document.getElementById('playback_play')
  // const playback_pause = document.getElementById('playback_pause')
  // playback_play.onclick = () => {
  //   playback_video.play()
  // }
  // playback_pause.onclick = () => {
  //   playback_video.pause()
  // }

  // let mixed_video_stream = new MediaStream()

  // // カメラ設定
  // var constraints = {
  //   // audio: { echoCancellation: true },
  //   audio: false,
  //   video: {
  //     width: { ideal: 300 },
  //     height: { ideal: 200 },
  //     // aspectRatio: 300 / 200,
  //     facingMode: "user"   // フロントカメラ
  //     // facingMode: { exact: "environment" }  // バックカメラ
  //   },
  // }
  // // カメラの内容を<vedio>に映る
  // navigator.mediaDevices.getUserMedia(constraints)
  //   .then((mediastream) => {
  //     console.log(mediastream.getVideoTracks()[0]);
      
  //     camera_video.srcObject = mediastream
  //     camera_video.onloadedmetadata = (e) => {
  //       camera_video.play()
  //     }

  //     (function video2Canvas () {
	// 			ctx.drawImage(camera_video, 0, 0)
	// 			// ctx.drawImage(sample_video, 0, 0, 640, 480, 10, 10, 160, 120)
	// 			requestAnimationFrame(video2Canvas)
	// 		})();

  //     // const mediaRecorder = new MediaRecorder(mediastream)
  //     // let mediaRecorder

  //     // record_start.onclick = () => {
  //     //   let track1 = sample_video.getVideoTracks()[0]
  //     //   console.log('track1', track1)
      
  //     //   let track2 = playback_canvas.captureStream().getVideoTracks()[0]
  //     //   console.log('track2', track2)
      
  //     //   mixed_video_stream.addTrack(track1)
  //     //   mixed_video_stream.addTrack(track2)
  //     //   console.log('mixed_video_stream', mixed_video_stream.getVideoTracks());
        
  //     //   mediaRecorder = new MediaRecorder(mixed_video_stream)

  //     //   mediaRecorder.start()
  //     //   console.log("recorder start", mediaRecorder.state)

  //     //   mediaRecorder.ondataavailable = (e) => {
  //     //     console.log(e)
            
  //     //     // const blob = new Blob([e.data], { type: e.data.type })
  //     //     const blob = new Blob([e.data], { type: e.data.type })
  //     //     const bloburl = URL.createObjectURL(blob)
  //     //     // playback_video.src = bloburl
  
  //     //     downloadlink.download = 'mixed.webm'
  //     //     downloadlink.href = bloburl
  //     //   }
  //     // }

  //     // record_stop.onclick = () => {
  //     //   mediaRecorder.stop()
  //     //   sample_video.pause()
  //     //   console.log("recorder stop", mediaRecorder)
  //     // }
  //   })
  //   .catch(function (err) {
  //     console.log(err.name + ": " + err.message)
  //   })

  // const photo_canvas = document.getElementById("photo")
  // const shutter = document.getElementById("shutter")
  // shutter.onclick = (e) => {
  //   const ctx = photo_canvas.getContext("2d")
  //   ctx.drawImage(camera_video, 0, 0, photo_canvas.width, photo_canvas.height)
  // }
}

function main() {
  let camera_video = document.getElementById('camera_video')
  let sample_video = document.getElementById('sample_video')

  let mixed_canvas = document.getElementById('mixed_canvas')
  let mixed_ctx = mixed_canvas.getContext('2d')
  
  let mixed_video = document.getElementById('mixed_video')
  let download_link = document.getElementById('download_link')

  let record_start = document.getElementById('record_start')
  let record_stop = document.getElementById('record_stop')

  let camera_stream

  let constraints = {
    // audio: { echoCancellation: true },
    audio: false,
    video: {
      width: 300,
      height: 200, 
      // aspectRatio: 300 / 200,
      facingMode: 'user' // フロントカメラ
    },
  }
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((camera_stream) => {
      camera_video.srcObject = camera_stream
      camera_video.onloadedmetadata = (e) => {
        camera_video.play()
      }

      sample_video.src = "sample.mp4"
      sample_video.onloadedmetadata = () => {
        sample_video.play()
      }

      (function video2Canvas () {
				mixed_ctx.drawImage(camera_video, 0, 0)
				mixed_ctx.drawImage(sample_video, 10, 10, 128, 72)
				requestAnimationFrame(video2Canvas)
      })();
      
      let mixed_video_stream = new MediaStream()
      let media_recorder

      record_start.onclick = () => {
        mixed_video_stream.addTrack(mixed_canvas.captureStream().getTracks()[0])
        
        media_recorder = new MediaRecorder(mixed_video_stream)
        media_recorder.start();
        media_recorder.ondataavailable = (e) => {
					var blob_url = URL.createObjectURL(e.data)
					mixed_video.src = blob_url
					download_link.download = 'mixed.webm'
					download_link.href = blob_url
				}
      }

      record_stop.onclick = () => {
				// video.pause();
				media_recorder.stop()
			}
    })
    .catch(err => {
      console.log(err.name + ": " + err.message)
    })
}
