<template>
  <div class="home-page">
    <!-- Logo Container -->
    <div class="logo-container">
      <img src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/e8ddc4da-23dd-4502-b65b-378c9cfe5efa/dfh9koj-efa07e64-9d87-4efd-ae56-0a92b3ce0fec.png/v1/fill/w_1280,h_1280/golden_dawn_insignia_by_jormxdos_dfh9koj-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI4MCIsInBhdGgiOiJcL2ZcL2U4ZGRjNGRhLTIzZGQtNDUwMi1iNjViLTM3OGM5Y2ZlNWVmYVwvZGZoOWtvai1lZmEwN2U2NC05ZDg3LTRlZmQtYWU1Ni0wYTkyYjNjZTBmZWMucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.HXKNwvwyq7Omc_Njx-z07SsuWXeik_8VFe6CvuW0sC8" alt="Golden Dawn Logo" />
    </div>
    <!-- Button Container -->
    <div class="buttons-wrapper">
      <router-link @click="goToMobileAttendance" to="/mobile" class="btn mobile-btn">
        Attendance (Mobile)
      </router-link>
      <router-link @click="goToWebAttendance" class="btn web-btn" to="#">
        Attendance (PC)
      </router-link>
      <router-link @click="goToIdRegistration" to="/generate-id" class="btn id-btn">
        ID Registration
      </router-link>
    </div>

    <!-- Footer Section -->
    <footer class="footer">
      <p>© 2025 Golden Dawn</p>
    </footer>
  </div>
</template>

<script setup>
  const goToMobileAttendance = () => {
    // Logic for mobile attendance page navigation
    console.log("Mobile Attendance clicked");
  };

  const goToWebAttendance = () => {
    // Logic for web attendance page navigation
    console.log("Web Attendance clicked");
  };

  const goToIdRegistration = () => {
    // Logic for ID registration page navigation
    console.log("ID Registration clicked");
  };
</script>

<style scoped>
/* Page Layout */
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: #fff;
  position: relative;
  padding: 20px;
}

/* Logo Section */
.logo-container {
  text-align: center;
  margin-bottom: 30px;
}

.logo-container img {
  max-width: 250px;
  height: auto;
  transition: transform 1s ease-in-out;
}

.logo-container img:hover {
  transform: scale(1.1);
}

/* Buttons Layout */
.buttons-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  max-width: 400px;
}

/* Button Styles */
.btn {
  text-align: center;
  width: 100%;
  border: none;
  padding: 10px 20px;
  font-size: 1.1rem; /* Responsive font size */
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-weight: 500;
}

.btn:hover {
  opacity: 0.9;
}

/* Individual Button Styles */
.mobile-btn {
  background-color: #e7c8b2; /* Light brown background */
  color: #352011; /* Dark brown text */
}

.web-btn {
  background-color: #e7c8b2; /* Light brown background */
  color: #352011; /* Dark brown text */
}

.id-btn {
  background-color: #f37878;
  color: white;
}

.btn:hover {
  background-color: #c8a082; /* Darker brown on hover */
}

/* Footer Styles */
.footer {
  margin-top: 50px;
  font-size: 0.9rem;
  color: #352011;
  text-align: center;
}

/* Media Queries */
@media (max-width: 768px) {
  .logo-container img {
    max-width: 200px; /* Adjust logo size for smaller screens */
  }

  .btn {
    font-size: 4vw;
  }
}

@media (max-width: 480px) {
  .logo-container img {
    max-width: 180px;
  }

  .btn {
    font-size: 5vw;
    padding: 12px;
  }
}
</style>
