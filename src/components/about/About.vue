<template>
  <div class="about">
    <h2>【スタッフ用】試験の確認はこちら：</h2>
    <p>※「nlpjapan5555」を入れたらすべての受講生の成績を確認できる(本番表示しない)</p>
    <UserScores />
  </div>
</template>

<script>
import UserScores from './UserScores.vue';

export default {
  components: {
    UserScores
  }
};
</script>
