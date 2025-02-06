<template>
  <div class="center">
    <!-- Logo -->
    <div v-if="captureRendering" class="logo-overlay">
      <img src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/e8ddc4da-23dd-4502-b65b-378c9cfe5efa/dfh9koj-efa07e64-9d87-4efd-ae56-0a92b3ce0fec.png/v1/fill/w_1280,h_1280/golden_dawn_insignia_by_jormxdos_dfh9koj-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI4MCIsInBhdGgiOiJcL2ZcL2U4ZGRjNGRhLTIzZGQtNDUwMi1iNjViLTM3OGM5Y2ZlNWVmYVwvZGZoOWtvai1lZmEwN2U2NC05ZDg3LTRlZmQtYWU1Ni0wYTkyYjNjZTBmZWMucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.HXKNwvwyq7Omc_Njx-z07SsuWXeik_8VFe6CvuW0sC8" alt="Golden Dawn Logo" />
    </div>
    
    <!-- Full screen blur background overlay -->
    <div v-if="captureRendering" class="blur-overlay"></div>
    
    <!-- Video container with blurred rectangle -->
    <div class="video-container">
      <video ref="videoElement" class="video-container" width="100%" height="100%" autoplay></video>
      
      <!-- Horizontal Rectangle in the center with blur effect outside -->
      <div class="center-rectangle">
        <div class="clear-inside"></div>
      </div>
      
      <canvas ref="canvasElement" style="display: none;"></canvas>
    </div>

    <!-- Capture Info and Buttons -->
    <div class="capture-info">
      <!-- Day buttons with icons -->
      <div class="day-buttons">
        <button
          v-for="dayOption in days"
          :key="dayOption.id"
          :class="['btn', selectedDay === dayOption.id ? 'selected-btn' : '']"
          @click="selectDay(dayOption.id)"
        >
          <i class="fas fa-calendar"></i> Day {{ dayOption.id }}
        </button>
      </div>

      <div class="buttons">
        {{ idNumber.value }}
        <button @click="stopAutoCapture" v-if="isCapturing" class="btn stop-btn">
          <i class="fas fa-stop-circle"></i> Stop Auto Capture
        </button>
        <button @click="startAutoCapture" v-else class="btn start-btn">
          <i class="fas fa-play-circle"></i> Start Auto Capture
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import Tesseract from 'tesseract.js';
  import axios from 'axios';
  import Swal from 'sweetalert2'

  const videoElement = ref(null);
  const canvasElement = ref(null);
  const idNumber = ref("No ID found");
  const isCapturing = ref(false);
  const selectedDay = ref(1); // Track the selected day

  const extracting = ref(false);
  const captureRendering = ref(false);

  const days = ref([
    { id: 1, name: 'Day 1' },
    { id: 2, name: 'Day 2' },
    { id: 3, name: 'Day 3' },
  ]);

  let captureInterval = null;
  let password = ref("goldendawn");

  const router = useRouter();

  const passcodeProtect = () => {
    let passcode = prompt("Enter Password");

    if (passcode === null){
      router.push({ name: 'home' });
      return;
    }

    while (passcode !== password.value) {
        alert("Incorrect PassCode");
        return passcodeProtect();
    }
  }

  // Start capturing video stream
  onMounted(() => {
    passcodeProtect();
    const video = videoElement.value;

    navigator.mediaDevices.getUserMedia({ video: {
        facingMode: "environment",
        width: { ideal: 1280 }, // Increase resolution for better quality
        height: { ideal: 720 }
      } })
      .then((stream) => {
        video.srcObject = stream;
      })
      .catch((err) => {
        console.error('Error accessing camera:', err);
      });
  });

  const setAuthHeader = () => {
    axios.defaults.headers.common['Content-Type'] = 'text/plain;charset=utf-8';
  };

  // Capture image every second
  const startAutoCapture = () => {
    if (!captureInterval) {
      extracting.value = true
      isCapturing.value = true;
      captureInterval = setInterval(() => {
        captureImage();
      }, 1000); // Capture every second
    }
  };

  // Stop auto capture
  const stopAutoCapture = () => {
    if (captureInterval) {
      extracting.value = false;
      isCapturing.value = false;
      clearInterval(captureInterval);
      captureInterval = null;
    }
  };

  // Capture image from video and process it
  const captureImage = () => {
    const video = videoElement.value;
    const canvas = canvasElement.value;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Apply grayscale effect to the image for better OCR accuracy
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const gray = 0.3 * r + 0.59 * g + 0.11 * b;
      imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = gray;
    }

    // Apply adaptive thresholding (making text more distinct)
    for (let i = 0; i < imageData.data.length; i += 4) {
      const gray = imageData.data[i];
      const threshold = 128;  // Adjust threshold value if needed
      const color = gray > threshold ? 255 : 0; // If grayscale value > threshold, make it white, else black
      imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = color;
    }

    sharpenImage(imageData);

    context.putImageData(imageData, 0, 0);

    // Now process the captured image using Tesseract.js
    const image = canvas.toDataURL();
    extractTextFromImage(image);
  };

  const sharpenImage = (imageData) => {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    // Sharpening matrix (simple 3x3 kernel)
    const kernel = [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ];

    const newData = new Uint8ClampedArray(data);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let r = 0, g = 0, b = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const i = ((y + ky) * width + (x + kx)) * 4;
            const kernelValue = kernel[ky + 1][kx + 1];
            r += data[i] * kernelValue;
            g += data[i + 1] * kernelValue;
            b += data[i + 2] * kernelValue;
          }
        }

        const i = (y * width + x) * 4;
        newData[i] = Math.min(Math.max(r, 0), 255);
        newData[i + 1] = Math.min(Math.max(g, 0), 255);
        newData[i + 2] = Math.min(Math.max(b, 0), 255);
      }
    }

    // Apply sharpened data back to the image
    imageData.data.set(newData);
  };

  const setPresent = async (body) => {
    setAuthHeader();
    stopAutoCapture();
    captureRendering.value = true

    try {
      await axios.post('https://script.google.com/macros/s/AKfycbwibs6LjDrAkm1Uta8l9X9muHocRDahcE9p5tZsuXNpfuGNdXnUcKJ1cfl_ZxEF_c2R/exec?' + body)
        .then((res) => {
          if(res.data != "Student is not in the list")
            Swal.fire({
              title: "Present!",
              text: res.data,
              icon: "success"
            });
          else
            Swal.fire({
              title: "Oops...",
              text: "Something went wrong, try again",
              icon: "error"
            });
          idNumber.value = "No ID found";
          captureRendering.value = false;
        })
        .catch((err) => {
          idNumber.value = "No ID found";
          captureRendering.value = false;
        });
    } catch (error) {
      console.error('Error marking student present:', error);
      idNumber.value = "No ID found";
      captureRendering.value = false;
    }
  };

  // Process image using OCR (Tesseract.js)
  const extractTextFromImage = async (image) => {
    try {
      const { data: { text } } = await Tesseract.recognize(image, 'eng', {
        logger: (m) => console.log(m),
        oem: 1, // OEM mode (0 - Tesseract only, 1 - LSTM only, 2 - Default, 3 - Both)
      });
      extractIDNumber(text);
    } catch (error) {
      console.error('OCR failed:', error);
    }
  };

  // Extract ID number from OCR text
  const extractIDNumber = (text) => {
    const matches = text.match(/C-(\d{4})-(\d{4})/);
    if (matches && extracting.value)
      setPresent(`studentId=${matches[0]}&day=${selectedDay.value + 2}`);
    else
      console.log("none")
  };

  // Change selected day
  const selectDay = (dayId) => {
    selectedDay.value = dayId;
  };

  // Cleanup when the component is unmounted
  onUnmounted(() => {
    if (captureInterval) {
      clearInterval(captureInterval);
    }

    const video = videoElement.value;
    if (video.srcObject) {
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());

    }
  });
</script>

<style scoped>
/* Container Style */
.center {
  display: flex;
/*  justify-content: center;*/
  align-items: center;
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;  /* Prevent scrolling */
  flex-direction: column;  /* Stack elements vertically */
}

.logo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: flip 2s infinite;
  z-index: 10;
}

.logo-overlay img {
  max-width: 20%;
  height: auto;
}

@keyframes flip {
  0% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(180deg);
  }
  100% {
    transform: rotateY(360deg);
  }
}

.blur-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  z-index: 5;
}


/* Fade-in animation */
@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* Video and Canvas Styling */
.video-container {
  position: relative;
  width: 100%;
  height: auto; 
  border-radius: 8px;
  max-width: 90%; /* Max width 90% of the container */
  max-height: 80vh; /* Max height 80% of the viewport */
}

.center-rectangle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60%;
  height: 20%;
  transform: translate(-50%, -50%);
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.clear-inside {
  /*height: 100%;
  width: 100%;*/
}

/* Button Styles */
.capture-info {
  text-align: center;
  margin-top: 20px;
}

.id-number {
  font-size: 6vw; /* Responsive font size */
  color: #352011;
  font-weight: bold;
}

.status-text {
  font-size: 4vw; /* Responsive font size */
  color: #7d6a5f; /* Medium brown for text */
}

.day-buttons {
  display: flex;
  justify-content: center;
  gap: 10px; /* Reduced gap to fit within small screens */
  margin: 15px 0;
  flex-wrap: wrap; /* Allows wrapping on smaller screens */
}

.btn {
  background-color: #e7c8b2; /* Light brown background */
  color: #352011; /* Dark brown text */
  border: none;
  padding: 10px 20px;
  font-size: 4vw; /* Responsive font size */
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background-color: #c8a082; /* Darker brown on hover */
}

.selected-btn {
  background-color: #f0b773; /* Golden yellow background for selected day */
  color: white;
}

.stop-btn {
  width: 100%;
  background-color: #f37878;
  color: white;
}

.start-btn {
  width: 100%;
  background-color: #78f3a5;
  color: white;
}

/* Media Queries */
@media (max-width: 768px) {
  .logo img {
    width: 20vw; /* Adjust for smaller screen */
  }

  .video-container {
    max-width: 95%;
    max-height: 70vh;
  }

  .center-rectangle {
    width: 60%;
    height: 20%;
  }

  .id-number {
    font-size: 8vw; /* Larger text for smaller screens */
  }

  .status-text {
    font-size: 5vw; /* Larger text for smaller screens */
  }

  .btn {
    font-size: 5vw; /* Larger buttons on smaller screens */
    padding: 12px 24px;
/*    width: 100%;*/
  }
}

/*@media (max-width: 615px) {
  .btn {
    width: 100%;
  }
}*/

@media (max-width: 480px) {
  .logo img {
    width: 25vw; /* Even smaller logo on very small screens */
  }

  .video-container {
    max-width: 100%;
    max-height: 60vh;
  }

  .center-rectangle {
    width: 80%;
    height: 20%;
  }

  .id-number {
    font-size: 10vw; /* Adjust text for smaller screens */
  }

  .status-text {
    font-size: 6vw; /* Adjust text for smaller screens */
  }

  /*.btn {
    font-size: 6vw; 
    padding: 15px 30px;
    width: 100%;
  }*/
}
</style>