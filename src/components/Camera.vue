<template>
  <div class="center">
    <!-- Logo -->
    <div class="logo">
      <img src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/e8ddc4da-23dd-4502-b65b-378c9cfe5efa/dfh9koj-efa07e64-9d87-4efd-ae56-0a92b3ce0fec.png/v1/fill/w_1280,h_1280/golden_dawn_insignia_by_jormxdos_dfh9koj-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI4MCIsInBhdGgiOiJcL2ZcL2U4ZGRjNGRhLTIzZGQtNDUwMi1iNjViLTM3OGM5Y2ZlNWVmYVwvZGZoOWtvai1lZmEwN2U2NC05ZDg3LTRlZmQtYWU1Ni0wYTkyYjNjZTBmZWMucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.HXKNwvwyq7Omc_Njx-z07SsuWXeik_8VFe6CvuW0sC8" alt="Golden Dawn Logo" />

    </div>
    
    <!-- Video container with blurred rectangle -->
    <div class="video-container">
      <video ref="videoElement" width="100%" height="100%" autoplay></video>
      
      <!-- Horizontal Rectangle in the center with blur effect outside -->
      <div class="center-rectangle">
        <div class="clear-inside"></div>
      </div>
      
      <canvas ref="canvasElement" style="display: none;"></canvas>
    </div>

    <!-- Capture Info and Buttons -->
    <div class="capture-info">
      <p v-if="isCapturing" class="id-number">{{ idNumber }}</p>
      <p v-else class="status-text">Auto capture turned off</p>
      <div class="buttons">
        <button @click="stopAutoCapture" v-if="isCapturing" class="btn stop-btn">Stop Auto Capture</button>
        <button @click="startAutoCapture" v-else class="btn start-btn">Start Auto Capture</button>
        <button @click="setPresent" class="btn start-btn">Sample</button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import Tesseract from 'tesseract.js';
  import axios from 'axios';

  const videoElement = ref(null);
  const canvasElement = ref(null);
  const idNumber = ref("Jimena, Ian Rey, R.");
  const isCapturing = ref(false);
  const day = ref(3); // default index is 3 for spreadsheet day 1
  let captureInterval = null;

  // Start capturing video stream
  onMounted(() => {
    const video = videoElement.value;

    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
      })
      .catch((err) => {
        console.error('Error accessing camera:', err);
      });
  });

  const setAuthHeader = () => {
    axios.defaults.headers = {
      accept: "text/plain;charset=utf-8",
      Authorization: `Bearer 4/0ASVgi3IxdH2PyAGYQWVzF4Som87385uo4bW8X37SjnohQX_257ud1APf7vCDbh8DWi-_Wg`
    }  
  }

  // Capture image every second
  const startAutoCapture = () => {
    if (!captureInterval) {
      isCapturing.value = true
      captureInterval = setInterval(() => {
        captureImage();
      }, 1000); // Capture every second
    }
  };

  // Stop auto capture
  const stopAutoCapture = () => {
    if (captureInterval) {
      isCapturing.value = false
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

    // Now process the captured image using Tesseract.js
    const image = canvas.toDataURL();
    extractTextFromImage(image);
  };

  const setPresent = async () => {
    setAuthHeader();

    try {
      const response = await axios.post('https://script.google.com/macros/s/AKfycbw4p79ThfdKYZobY9jB4Simc4D_2HyrQBJD2-xtqrfLyUP7Sns2Nd684uR1HlZLyv4r/exec', {
            studentId: idNumber.value,
            day: day.value
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error marking student present:', error)
    }
  }

  // Process image using OCR (Tesseract.js)
  const extractTextFromImage = async (image) => {
    try {
      const { data: { text } } = await Tesseract.recognize(image, 'eng');
      idNumber.value = extractIDNumber(text);
      setPresent()
    } catch (error) {
      console.error('OCR failed:', error);
    }
  };

  // Extract ID number from OCR text
  const extractIDNumber = (text) => {
    const matches = text.match(/C-(\d{4})-(\d{4})/);
    return matches ? matches[0] : 'No ID found';
  };

  // Cleanup when the component is unmounted
  onUnmounted(() => {
    if (captureInterval) {
      clearInterval(captureInterval);
    }

    // Stop video stream when component is destroyed
    const video = videoElement.value;
    if (video.srcObject) {
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
  });
</script>

<style scoped>
.center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #fff;
  font-family: 'Arial', sans-serif;
  color: #333;
}

.logo {
  margin-bottom: 20px;
}

.logo img {
  width: 150px; /* Adjust the size of the logo */
}

.video-container {
  position: relative;
  width: 80%;
  max-width: 800px;
  margin-bottom: 20px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.center-rectangle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;  /* Rectangle width */
  height: 20%;  /* Rectangle height */
  background: rgba(255, 255, 255, 0.1); /* Light transparent background */
  border-radius: 5px; /* Optional: Rounded corners */
}

.clear-inside {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.5); /* Clearer inside */
  border-radius: 5px;
}

.capture-info {
  text-align: center;
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 80%;
  max-width: 800px;
}

.id-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333; /* Standard text color */
}

.status-text {
  font-size: 1.2rem;
  color: #7f8c8d;
}

.buttons {
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn {
  background-color: #3498db; /* Blue color */
  color: white;
}

.stop-btn {
  background-color: #e74c3c;
  color: white;
}

.start-btn:hover {
  background-color: #2980b9;
}

.stop-btn:hover {
  background-color: #c0392b;
}
</style>
