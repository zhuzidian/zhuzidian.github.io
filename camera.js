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
}

function main() {
  let camera_video = document.getElementById('camera_video')
  let sample_video = document.getElementById('sample_video')

  let mixed_canvas = document.getElementById('mixed_canvas')
  let mixed_context = mixed_canvas.getContext('2d')
  
  let mixed_video = document.getElementById('mixed_video')
  let download_link = document.getElementById('download_link')

  let record_start = document.getElementById('record_start')
  let record_stop = document.getElementById('record_stop')

  let camera_stream

  let constraints = {
    // audio: { echoCancellation: true },
    audio: false,
    video: {
      width: 320,
      height: 180, 
      // aspectRatio: 320 / 180,
      facingMode: 'user' // フロントカメラ
    },
  }
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((camera_stream) => {
      camera_video.srcObject = camera_stream
      camera_video.onloadedmetadata = () => {
        camera_video.play()
      }

      sample_video.src = "missile.mp4"
      sample_video.onloadedmetadata = () => {
        sample_video.play()
      }

      video2Canvas()

      // let mixed_video_stream = new MediaStream()
      // let media_recorder

      // record_start.onclick = () => {
      //   mixed_video_stream.addTrack(mixed_canvas.captureStream().getTracks()[0])
        
      //   media_recorder = new MediaRecorder(mixed_video_stream)
      //   media_recorder.start();
      //   media_recorder.ondataavailable = (e) => {
			// 		var blob_url = URL.createObjectURL(e.data)
			// 		mixed_video.src = blob_url
			// 		download_link.download = 'mixed.webm'
			// 		download_link.href = blob_url
			// 	}
      // }

      // record_stop.onclick = () => {
			// 	// video.pause();
			// 	media_recorder.stop()
			// }
    })

  const video2Canvas = () => {
    // 320*180
    mixed_context.drawImage(camera_video, 0, 0)
    // 160*90
    mixed_context.drawImage(sample_video, 0, 0, sample_video.width, sample_video.height)
    chromaKey()
    requestAnimationFrame(video2Canvas)
  }

  var chromaKey = function () {
    var imageData = mixed_context.getImageData(0, 0, sample_video.width, sample_video.height)

    // dataはUint8ClampedArray
    // 長さはcanvasの width * height * 4(r,g,b,a)
    // 先頭から、一番左上のピクセルのr,g,b,aの値が順に入っており、
    // 右隣のピクセルのr,g,b,aの値が続く
    // n から n+4 までが1つのピクセルの情報となる
    for (var i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];      
      // 閾値
      const condition = r < 80 && g > 200 && b < 80;
      if (condition) {
        imageData.data[i + 3] = 0;
      }
      // var target_rgb = {
      //   r: imageData.data[i],
      //   g: imageData.data[i + 1],
      //   b: imageData.data[i + 2]
      // };

      // // chromaKeyColorと現在のピクセルの三次元空間上の距離を閾値と比較する
      // // 閾値より小さい（色が近い）場合、そのピクセルを消す
      // const distance = getColorDistance(chroma_key_rgb, target_rgb)
      // if (distance < colorDistance) {
      //   // alpha値を0にすることで見えなくする
      //   imageData.data[i + 3] = 0;
      // }
    }
    
    mixed_context.putImageData(imageData, 0, 0);
  };
  
  var getColorDistance = function (rgb1, rgb2) {
    // 三次元空間の距離が返る
    return Math.sqrt(
        Math.pow((rgb1.r - rgb2.r), 2) +
        Math.pow((rgb1.g - rgb2.g), 2) +
        Math.pow((rgb1.b - rgb2.b), 2)
    );
  };
}

// 消す色と閾値
var chroma_key_rgb = { r: 0, g: 255, b: 0 }
var colorDistance = 100