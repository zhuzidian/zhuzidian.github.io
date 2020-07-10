let sample

// 消す色と閾値
let chroma_key_rgb = { r: 0, g: 255, b: 0 }
let colorDistance = 80

// mixed width height
let mixed_sample_video_width = 320
let mixed_sample_video_height = 180

let alpha = 255

function onAlphaUp() {
  if (alpha > 0) alpha -= 32;
}

function onAlphaDown() {
  if (alpha < 255) alpha += 32;
}


function onSizeUp() {
  mixed_sample_video_width += 32
  mixed_sample_video_height += 18
}

function onSizeDown() {
  if (mixed_sample_video_width > 32) {
    mixed_sample_video_width -= 32
  }
  
  if (mixed_sample_video_height > 18) {
    mixed_sample_video_height -= 18
  }
}

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

  const urlParams = new URLSearchParams(window.location.search)
  sample = urlParams.get('sample')
  if (!sample) sample = 'rem'

  main()
}

const main = () => {
  let camera_video = document.getElementById('camera_video')
  let sample_video = document.getElementById('sample_video')

  let mixed_canvas = document.getElementById('mixed_canvas')
  let mixed_context = mixed_canvas.getContext('2d')
  
  let mixed_video = document.getElementById('mixed_video')
  let download_link = document.getElementById('download_link')

  let record_start = document.getElementById('record_start')
  let record_stop = document.getElementById('record_stop')

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

      sample_video.src = sample + '.mp4'
      sample_video.onloadedmetadata = () => {
        sample_video.play()
      }
      
      if (['rem', 'dancing'].includes(sample)) {
        mixVideo1()
      } else {
        mixVideo2()
      }

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

  const mixVideo1 = () => {
    // 320*180
    mixed_context.globalCompositeOperation = 'source-over'
    mixed_context.drawImage(camera_video, 0, 0)

    // 160*90
    mixed_context.globalCompositeOperation = 'screen'
    // mixed_context.globalCompositeOperation = 'overlay'
    // mixed_context.globalCompositeOperation = 'lighter'
    // mixed_context.drawImage(sample_video, 0, 0, mixed_canvas.width, mixed_canvas.height)
    mixed_context.drawImage(
      sample_video, 
      (320 - mixed_sample_video_width) / 2,
      (180 - mixed_sample_video_height) / 2,
      mixed_sample_video_width,
      mixed_sample_video_height
    )

    window.requestAnimationFrame(mixVideo1)
  }

  const mixVideo2 = () => {
    mixed_context.globalCompositeOperation = 'source-in'
    mixed_context.drawImage(
      sample_video, 
      (320 - mixed_sample_video_width) / 2,
      (180 - mixed_sample_video_height) / 2,
      mixed_sample_video_width,
      mixed_sample_video_height
    )
    chromaKey()

    // 320*180
    mixed_context.globalCompositeOperation = 'destination-over'
    mixed_context.drawImage(camera_video, 0, 0)

    window.requestAnimationFrame(mixVideo2)
  }

  var chromaKey = function () {
    var imageData = mixed_context.getImageData(
      (320 - mixed_sample_video_width) / 2,
      (180 - mixed_sample_video_height) / 2,
      mixed_sample_video_width,
      mixed_sample_video_height
    )
    // console.log(imageData);
    

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
      } else if (['fish', 'missile'].includes(sample)) {
        imageData.data[i + 3] = alpha
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
    
    mixed_context.putImageData(
      imageData, 
      (320 - mixed_sample_video_width) / 2,
      (180 - mixed_sample_video_height) / 2
    );
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

