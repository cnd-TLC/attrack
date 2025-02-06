<template>
  <div class="student-page">
    <!-- Logo -->
    <div v-if="tableLoading" class="logo-overlay">
      <img src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/e8ddc4da-23dd-4502-b65b-378c9cfe5efa/dfh9koj-efa07e64-9d87-4efd-ae56-0a92b3ce0fec.png/v1/fill/w_1280,h_1280/golden_dawn_insignia_by_jormxdos_dfh9koj-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI4MCIsInBhdGgiOiJcL2ZcL2U4ZGRjNGRhLTIzZGQtNDUwMi1iNjViLTM3OGM5Y2ZlNWVmYVwvZGZoOWtvai1lZmEwN2U2NC05ZDg3LTRlZmQtYWU1Ni0wYTkyYjNjZTBmZWMucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.HXKNwvwyq7Omc_Njx-z07SsuWXeik_8VFe6CvuW0sC8" alt="Golden Dawn Logo" />
    </div>
    
    <!-- Full screen blur background overlay -->
    <div v-if="tableLoading" class="blur-overlay"></div>

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
      <button class="btn">Add ID</button>
    </div>


    <table class="student-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Gender</th>
          <th>Course</th>
          <th>Year Level</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="student in paginatedStudents" :key="student.studentName">
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

const searchQuery = ref('');
const selectedGender = ref('');
const selectedCourse = ref('');
const selectedYear = ref('');
const students = ref([]);
const tableLoading = ref(true);
const currentPage = ref(1);
const itemsPerPage = 10;  // Number of students to show per page

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
  await axios.get(`https://script.google.com/macros/s/AKfycbxppBoL7x4cb9XBsCoqAxDpiAUtmB98uJ9gINsfASMaQOTn0CqeUyML8x4mDykR2A2Z/exec`).then((res) => {
    students.value = res.data;
    tableLoading.value = false;
  });
}

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

.btn {
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
