<template>
  <div class="student-page">
    <button class="floating-btn" @click="goToHome">🏠︎</button>

    <div class="filters-container">
      <!-- Search input -->
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name..."
        class="search-input"
      />
      <!-- Gender Filter -->
      <select v-model="selectedGender" class="filter-select">
        <option value="">Filter by Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
      <!-- Course Filter -->
      <select v-model="selectedCourse" class="filter-select">
        <option value="">Filter by Course</option>
        <option value="BEED">BEED</option>
        <option value="BSed - English">BSed - English</option>
        <option value="BSed - Math">BSed - Math</option>
        <option value="BSEntrep">BSEntrep</option>
        <option value="BSBA - Financial Mngt.">BSBA - Financial Mngt.</option>
        <option value="BSBA - Marketing Mngt.">BSBA - Marketing Mngt.</option>
        <option value="BSBA - Operations Mngt.">BSBA - Operations Mngt.</option>
        <option value="BSIT">BSIT</option>
        <option value="ACT - Networking">ACT - Networking</option>
        <option value="ACT - AppDev">ACT - AppDev</option>
      </select>
      <!-- Year Filter -->
      <select v-model="selectedYear" class="filter-select">
        <option value="">Filter by Year</option>
        <option value="First Year">First Year</option>
        <option value="Second Year">Second Year</option>
        <option value="Third Year">Third Year</option>
        <option value="Fourth Year">Fourth Year</option>
      </select>
    </div>
    <div class="buttons">
      <button class="btn" :disabled="loadingContents" @click="showModal = true">Add Student ID</button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h2 class="modal-header">Add Student ID</h2>
        <div class="modal-body">
          <!-- Sample Names Dropdown -->
          <label class="input-label" >Student Name <span class="important">*</span></label>
          <select v-model="selectedName" class="names-selector">
            <option value="">Select Name</option>
            <option v-for="student in students" :value="student.studentName">{{ student.studentName }}</option>
          </select>

          <!-- Label with Inputs -->
          <label class="input-label" >Student ID <span class="important">*</span></label>
          <div class="id-input-container">
            <label class="id-label" for="studentIdYear">C</label>
            <label class="id-label" for="studentIdYear">-</label>
            <input class="id-input-box" v-model="studentIdYear" type="text" id="studentIdYear" placeholder="####" />
            <label class="id-label" for="studentIdNumber">-</label>
            <input class="id-input-box" v-model="studentIdNumber" type="text" id="studentIdNumber" placeholder="####" />
          </div>
        </div>
        <!-- Save Button -->
        <div class="buttons-container" v-if="!savingId">
          <button @click="saveStudent" :disabled="savingId" class="save-btn">Save</button>
          <button @click="showModal = false" class="cancel-btn">Cancel</button>
        </div>
        <div class="buttons-container" v-else>
          <span > Please wait... </span>
        </div>
      </div>
    </div>

    <table class="student-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Gender</th>
          <th>Course</th>
          <th>Year Level</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td v-if="loadingContents" colspan="5" class="loading-row">
            <div class="loading-bar"></div>
          </td>
        </tr>
        <tr v-for="student in paginatedStudents" :key="student.studentName">
          <td>
            <span class="available" v-if="student.studentId">{{ student.studentId }}</span>
            <span class="not-available" v-else>n/a</span>
          </td>
          <td>{{ student.studentName }}</td>
          <td>{{ student.studentGender }}</td>
          <td>{{ student.studentCourse }}</td>
          <td>{{ student.studentYearLevel }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination Controls -->
    <div class="pagination-controls">
      <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">Next</button>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import axios from 'axios';
  import Swal from 'sweetalert2'
  import { useRouter } from 'vue-router';

  const router = useRouter();

  const searchQuery = ref('');
  const selectedGender = ref('');
  const selectedCourse = ref('');
  const selectedYear = ref('');
  const studentIdYear = ref('');
  const studentIdNumber = ref('');
  const selectedName = ref('');
  const students = ref([]);
  const loadingContents = ref(true);
  const currentPage = ref(1);
  const itemsPerPage = 10;  // Number of students to show per page
  const showModal = ref(false);
  const savingId = ref(false);

  const filteredStudents = computed(() => {
    return students.value.filter((student) => {
      const matchesSearch =
        student.studentName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        searchQuery.value === '';
      const matchesGender =
        (selectedGender.value === '' || student.studentGender === selectedGender.value);
      const matchesCourse =
        (selectedCourse.value === '' || student.studentCourse === selectedCourse.value);
      const matchesYear =
        (selectedYear.value === '' || student.studentYearLevel === selectedYear.value);

      currentPage.value = 1;
      return matchesSearch && matchesGender && matchesCourse && matchesYear;
    });
  });

  const goToHome = () => {
    router.push({ name: 'home' });
    return;
  }

  const setAuthHeader = () => {
    axios.defaults.headers.common['Content-Type'] = 'text/plain;charset=utf-8';
  };

  const totalPages = computed(() => {
    return Math.ceil(filteredStudents.value.length / itemsPerPage);
  });

  const paginatedStudents = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredStudents.value.slice(start, end);
  });

  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages.value) {
      currentPage.value = newPage;
    }
  };

  const getStudents = async () => {
    loadingContents.value = true;
    students.value = [];
    await axios.get(`https://script.google.com/macros/s/AKfycbyz9nQw-_Y55_0cFxh6EJdizqO9X3G0dXAY1OXPTv8t_zrOSvfGwLwt6NnehkUOSV-0/exec`).then((res) => {
      students.value = res.data;
      loadingContents.value = false;
    });
  }

  const saveStudent = async () => {
    setAuthHeader();
    savingId.value = true
    const body = `studentId=C-${studentIdYear.value}-${studentIdNumber.value}&studentName=${selectedName.value}`

    // Handle saving the student ID
    try {
      if (selectedName.value !== ""){
        await axios.post('https://script.google.com/macros/s/AKfycbwqBLaCXBSZIgVHXqdrxlZglu7CEvQx76WuB3Uppbm1dMuZ7LRyfwnWUgWCxGenkSRc/exec?' + body)
          .then((res) => {
            console.log(body)
            if(res.data != "Student is not in the list" && res.data != "ID format is not valid"){
              Swal.fire({
                title: "ID Added!",
                text: res.data,
                icon: "success"
              });
              // Reset fields
              studentIdYear.value = '';
              studentIdNumber.value = '';
              selectedName.value = '';
              showModal.value = false; // Close the modal
              getStudents();
            }
            else if(res.data == "ID format is not valid"){
              Swal.fire({
                title: "Invalid ID!",
                text: res.data,
                icon: "warning"
              });
            }
            else
              Swal.fire({
                title: "Oops...",
                text: "Something went wrong, try again",
                icon: "error"
              });

            savingId.value = false;
          })
          .catch((err) => {
            studentIdYear.value = '';
            studentIdNumber.value = '';
            selectedName.value = '';
            showModal.value = false;
            savingId.value = false;
          });
        }
        savingId.value = false;
    } catch (error) {
      console.error('Error setting ID:', error);
      studentIdYear.value = '';
      studentIdNumber.value = '';
      selectedName.value = '';
      showModal.value = false;
      savingId.value = false;
    }
    
  };

  onMounted(() => {
    getStudents();
  })
</script>

<style scoped>
/* Layout */
.student-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100vh !important;
  background-color: #fff;
  padding: 20px;
  font-family: 'Arial', sans-serif;
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

.available {
  font-size: 14px;
  font-weight: 700;
  color: #f0b773;
}

.not-available {
  font-size: 14px;
  font-weight: 700;
  color: #f37878;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 15;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Soft shadow around modal */
}

.modal-header {
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #352011; /* Dark Brown */
  border-bottom: 2px solid #f0b773; /* Golden Yellow */
  padding-bottom: 10px;
}

.modal-body {
  padding: 10px 0px;
}

.input-label {
  margin-top: 10px;
  display: block;
  text-align: left;
  font-size: .8rem;
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
  gap: 10px;
}

.id-label {
  font-size: 1.5rem;
}

.id-input-box {
  font-size: 1rem;
  padding: 12px 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
  width: 100%;
  background-color: #fff;
  transition: all 0.3s ease;
}

.buttons-container {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  justify-content: center;
  border-top: 2px solid #f0b773; /* Golden Yellow */
  padding-top: 20px;
}

.save-btn {
  background-color: #f0b773; /* Golden Yellow */
  color: #352011; /* Dark Brown */
  border: none;
  padding: 10px 20px;
  font-size: 1.1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cancel-btn {
  background-color: #ddd;
  color: #352011; /* Dark Brown */
  border: none;
  padding: 10px 20px;
  font-size: 1.1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.save-btn:hover,
.cancel-btn:hover {
  opacity: 0.9;
  background-color: #c8a082; /* Darker Golden Yellow */
}

/* Filters Section */
.filters-container {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  justify-content: center;
  width: 100%;
  max-width: 1920px;
}

/* Search Input and Filter Styles */
.search-input,
.filter-select {
  padding: 12px 16px;
  font-size: 1rem;
  border-radius: 5px;
  border: 1px solid #ccc;
  width: 100%;
/*  max-width: 220px;*/
  transition: all 0.3s ease;
  background-color: #fff;
}

.search-input:focus,
.filter-select:focus {
  border-color: #78f3a5; /* Light Green */
  outline: none;
  box-shadow: 0 0 5px rgba(120, 243, 165, 0.5); /* Subtle focus shadow */
}

.buttons {
  display: block;
  width: 100%;
}

.btn {
  width: 100%;
  background-color: #e7c8b2;
  color: #352011;
  border: none;
  padding: 10px 20px;
  font-size: 1.1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background-color: #c8a082;
}

/* Table Styles */
.student-table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Soft shadow around table */
}

.student-table th, .student-table td {
  padding: 12px 16px;
  text-align: left;
  font-size: 1rem;
}

.student-table th {
  background-color: #f0b773; /* Golden Yellow */
  color: #352011; /* Dark Brown */
  font-weight: 600;
}

.student-table tr:nth-child(even) {
  background-color: #f5f5f5;
}

.student-table tr:nth-child(odd) {
  background-color: #fff;
}

.student-table tr:hover {
  background-color: #f0e4c1; /* Soft Yellow */
}

.student-table td {
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

/* Loading Indicator */
.loading-row {
  text-align: center;
  height: 50px;
}

.loading-bar {
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #f0b773 25%, #f9e2b3 50%, #f0b773 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite ease-in-out;
  margin: 0 auto;
  border-radius: 5px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Footer */
.footer {
  margin-top: 50px;
  font-size: 0.9rem;
  color: #352011;
  text-align: center;
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

/* Media Queries for Responsiveness */
@media (max-width: 768px) {
  .filters-container {
    flex-direction: column;
  }

  .search-input,
  .filter-select {
    width: 100%;
  }

  .student-table th, .student-table td {
    padding: 10px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .filters-container {
    flex-direction: column;
  }

  .modal-content {
    margin: 0px 20px;
  }

  .search-input,
  .filter-select {
    width: 100%;
    padding: 10px 12px;
  }
}

/* Pagination Controls */
.pagination-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination-controls button {
  background-color: #e7c8b2;
  color: #352011;
  border: none;
  padding: 10px 20px;
  font-size: 1.1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.pagination-controls button:hover {
  background-color: #c8a082;
}

.pagination-controls button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

.pagination-controls span {
  font-size: 1rem;
  font-weight: 600;
}
</style>
