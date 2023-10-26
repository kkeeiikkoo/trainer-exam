<template>
  <div class="home">

    <LoginPage/>
  </div>
</template>

<script>
// @ is an alias to /src
import ResultPage from '@/components/ResultPage/ResultPage.vue'
import LoginPage from '@/components/LoginPage/LoginPage.vue'

export default {
  name: 'HomeView',
  components: {
    ResultPage,
    LoginPage
  },
   methods: {
    goBack() {
      this.$router.push('/');
    }
  }
}
</script>
