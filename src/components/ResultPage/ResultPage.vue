<template>
  <div class="result-page">
    <h1 class="result-header">LABトレトレ合格しました。</h1>
    <p class="result-text">おめでとうございます！</p>
    <!-- <button @click="goBack" class="result-button">再びチャレンジ</button> -->
  </div>
</template>

<script>
export default {
  methods: {
    goBack() {
      this.$router.push('/quiz'); //你的quiz页面的路由
    },
  },
};
</script>

<style scoped>
.result-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  background-color: #f8f8f8;
}

.result-header {
  font-size: 2.5em;
  color: #4caf50; 
}

.result-text {
  font-size: 1.5em;
  margin-top: 20px;
}

.result-button {
  margin-top: 30px;
  padding: 10px 20px;
  font-size: 1em;
  color: white;
  background-color: #4caf50; 
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
