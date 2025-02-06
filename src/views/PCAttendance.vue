<template>
  <div class="container">
    <!-- Left side: Inputs and Submit Button -->
    <div class="left-side">
      <input v-model="input1" placeholder="Input 1" />
      <input v-model="input2" placeholder="Input 2" />
      <button @click="submit">Submit</button>
    </div>

    <!-- Right side: Result -->
    <div class="right-side" v-if="submitted">
      {{ result }} is marked as present
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  setup() {
    const input1 = ref("");
    const input2 = ref("");
    const result = ref("");
    const submitted = ref(false);

    const submit = () => {
      result.value = `C-${input1.value}-${input2.value}`;
      submitted.value = true;
    };

    return { input1, input2, submit, result, submitted };
  },
};
</script>

<style scoped>
.container {
  display: flex;
  justify-content: space-between;
  padding: 20px;
}

.left-side {
  display: flex;
  flex-direction: column;
  width: 40%;
}

.right-side {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40%;
}

input {
  margin-bottom: 10px;
  padding: 8px;
  font-size: 14px;
}

button {
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>
