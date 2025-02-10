<template>
  <div class="container">
    <button class="floating-btn" @click="goToHome">🏠︎</button>
    
    <!-- Left Container: C-<input>-<input> layout with submit button -->
    <div class="input-container">
      <div class="id-input-container">
        <label class="id-label" for="studentIdYear">C</label>
        <label class="id-label" for="studentIdYear">-</label>
        <input class="id-input-box" v-model="studentIdYear" type="text" id="studentIdYear" placeholder="####" />
        <label class="id-label" for="studentIdNumber">-</label>
        <input class="id-input-box" v-model="studentIdNumber" type="text" id="studentIdNumber" placeholder="####" />
      </div>
      <div class="day-buttons">
        <button
          v-for="dayOption in days"
          :key="dayOption.id"
          :class="['btn', selectedDay === dayOption.id ? 'selected-btn' : '']"
          @click="selectDay(dayOption.id)"
        >
          <!-- <i class="icon fas fa-calendar"></i> -->
          <!-- <br /> -->
          Day {{ dayOption.id }}
          <hr :class="['btn-line', selectedDay === dayOption.id ? 'selected-btn-line' : '']" />
        </button>
      </div>
      <!-- Save Button -->
      <div class="save-buttons-container" v-if="!savingId">
        <button @click="setPresent" :disabled="savingId" class="submit-btn">Mark as Present</button>
      </div>
      <div class="save-buttons-container" v-else>
        <span>Please wait...</span>
      </div>
    </div>

    <!-- Right Container: Fixed space, centered content -->
    <div class="content-container">
      <div class="result">{{ result }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const studentIdYear = ref('');
const studentIdNumber = ref('');
const result = ref('');
const savingId = ref(false);
const selectedDay = ref(1); // Track the selected day
const days = ref([
  { id: 1, name: 'Day 1' },
  { id: 2, name: 'Day 2' },
  { id: 3, name: 'Day 3' },
  { id: 4, name: 'Day 4' },
]);

let password = ref("goldendawn");
let passcode = "";

const setAuthHeader = () => {
  axios.defaults.headers.common['Content-Type'] = 'text/plain;charset=utf-8';
};

const passcodeProtect = () => {
  passcode = prompt("Enter Password");

  if (passcode === null){
    router.push({ name: 'home' });
    return;
  }

  while (passcode !== password.value) {
      alert("Incorrect Password");
      return passcodeProtect();
  }
}

const goToHome = () => {
  router.push({ name: 'home' });
  return;
} 

const selectDay = (dayId) => {
  selectedDay.value = dayId;
};

const setPresent = async () => {
  savingId.value = true;
  setAuthHeader();
  let body = `studentId=C-${studentIdYear.value}-${studentIdNumber.value}&day=${selectedDay.value + 2}`;

  try {
    await axios
      .post('https://script.google.com/macros/s/AKfycbwibs6LjDrAkm1Uta8l9X9muHocRDahcE9p5tZsuXNpfuGNdXnUcKJ1cfl_ZxEF_c2R/exec?' + body)
      .then((res) => {
        if (res.data != 'Student is not in the list') result.value = res.data;
        else result.value = res.data;
        savingId.value = false;
      })
      .catch((err) => {
        savingId.value = false;
      });
  } catch (error) {
    console.error('Error marking student present:', error);
    savingId.value = false;
  }
};

onMounted(() => {
  passcodeProtect();
});
</script>

<style scoped>
/* Main container: Use Grid layout with two columns */
.container {
  display: grid;
  grid-template-columns: 1fr 2fr; /* Left takes 1/3 of space, right takes 2/3 */
  gap: 20px;
  padding: 20px;
  font-family: 'Arial', sans-serif;
  background-color: #fff; /* Soft background */
  height: 100vh;
  align-items: center; /* Vertically center the whole container */
}

/* Floating Button Styles */
.floating-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #f0b773; /* Golden Yellow */
  color: #352011; /* Dark Brown */
  border: none;
  padding: 10px;
  font-size: 1rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Soft shadow */
  transition: background-color 0.3s ease;
  z-index: 100; /* Ensure the button is on top of other content */
}

.floating-btn:hover {
  background-color: #c8a082; /* Darker Golden Yellow */
}

.floating-btn:focus {
  outline: none;
}

/* Left Container (Input + Submit Button) */
.input-label {
  margin-top: 10px;
  display: block;
  text-align: left;
  font-size: 1rem;
  font-weight: 600;
  color: #352011; /* Dark Brown */
}

.important {
  color: red;
}

.names-selector {
  padding: 12px 16px;
  font-size: 1rem;
  border-radius: 5px;
  border: 1px solid #ccc;
  width: 100%;
  background-color: #fff;
  transition: all 0.3s ease;
}

/* id input styling */
.id-input-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.id-label {
  font-size: 1.5rem;
  font-weight: bold;
}

.id-input-box {
  font-size: 1.1rem;
  padding: 14px 20px;
  border-radius: 5px;
  border: 1px solid #ccc;
  width: 100%;
  background-color: #fff;
  transition: all 0.3s ease;
}

.id-input-box:focus {
  border-color: #f0b773; /* Golden Yellow */
  box-shadow: 0 0 5px rgba(240, 183, 115, 0.6);
}

/* Button Containers */
.save-buttons-container {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  justify-content: center;
  border-top: 2px solid #f0b773; /* Golden Yellow */
  padding-top: 20px;
}

.submit-btn {
  background-color: #f0b773; /* Golden Yellow */
  color: #352011; /* Dark Brown */
  border: none;
  padding: 12px 24px;
  font-size: 1.2rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  opacity: 0.9;
  background-color: #c8a082; /* Darker Golden Yellow */
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Right Container: Centered fixed space */
.content-container {
  display: flex;
  justify-content: center; /* Center horizontally */
  align-items: center; /* Center vertically */
  background-color: #f4f4f4; /* Light background color for contrast */
  padding: 20px;
  border-radius: 5px;
  border: 1px solid #ddd;
  box-sizing: border-box;
  height: 100%; /* Full height for the right container */
}

.result {
  font-size: 1.4rem;
  color: #4caf50; /* Green */
  font-weight: bold;
  text-align: center;
}

/* Day Buttons */
/* Day Buttons */
.day-buttons {
  display: flex;
  justify-content: center; /* Center the buttons horizontally */
  margin: 20px 0;
  gap: 0; /* Remove any gap between the buttons */
}

.btn-line {
  border: 1px solid #352011;
}

.selected-btn-line {
  background-color: #f0b773;
  border: 1px solid white;
}

.btn {
  background-color: #e7c8b2;
  color: #352011;
  border: none;
  padding: 10px 18px;
  font-size: 1.1rem;
  border-radius: 0; /* Remove border-radius by default */
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  display: inline-block; /* Ensure the buttons stick together */
}

.btn:first-child {
  border-top-left-radius: 5px; /* Add border-radius to the left edge of the first button */
  border-bottom-left-radius: 5px; /* Add border-radius to the left edge of the first button */
}

.btn:last-child {
  border-top-right-radius: 5px; /* Add border-radius to the right edge of the last button */
  border-bottom-right-radius: 5px; /* Add border-radius to the right edge of the last button */
}

.btn:hover {
  background-color: #c8a082;
}

.selected-btn {
  background-color: #f0b773;
  color: white;
}

/* Responsive design for smaller screens */
@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr; /* Stack the left and right containers on small screens */
    padding: 10px;
  }

  .input-container {
    align-items: flex-start; /* Align inputs and button to the start on smaller screens */
    gap: 10px; /* Reduce the gap between inputs and button */
  }

  .input-area {
    flex-direction: column; /* Stack the inputs vertically */
    gap: 5px; /* Reduced gap for vertical stacking */
  }

  .input-area label {
    margin-right: 0;
    margin-bottom: 5px; /* Add space below label when stacked */
  }

  .input-container button {
    padding: 10px 20px; /* Reduce padding on smaller screens */
  }

  .content-container {
    margin-top: 20px; /* Add margin to the content container on small screens */
  }

  .result {
    font-size: 1rem; /* Make the result text smaller on small screens */
  }
}

@media (max-width: 480px) {
  .input-container {
    gap: 5px; /* Reduce space between elements further on extra small screens */
  }

  .input-area input {
    width: 100%; /* Make inputs full-width on very small screens */
  }
}
</style>
