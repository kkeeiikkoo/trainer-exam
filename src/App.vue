<template>
  <nav>
    <!-- <router-link to="/" v-show="isQuizStarted">{{ linkText }}</router-link>  -->
    <router-link to="/">{{ linkText }}</router-link>
    <router-link v-if="!isQuizStarted" to="/about"> | 成績確認</router-link> 
    <router-link v-if="!isQuizStarted" to="/Staff"> | スタッフ用</router-link>
  </nav>
  <router-view/>
</template>

<script>
export default {
  computed: {
    isQuizStarted() {
      return this.$route.path !== '/' &&  this.$route.path !== '/about'  &&  this.$route.path !== '/Staff';
    },
    linkText() {
      // return this.isQuizStarted ? '← ログイン画面に戻る' : '';
      return this.isQuizStarted ? '← ログイン画面に戻る' : '試験ページ';
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;
    text-decoration: none;

    &.router-link-exact-active {
      color: #42b983;
    }

    &:hover{
      color: #107e4c;
      text-decoration: underline;
    }

        &.router-link-exact-active:hover {
      color: #42b983;
      text-decoration: none;
    }
  }
}
</style>
