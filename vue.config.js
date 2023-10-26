// const { defineConfig } = require('@vue/cli-service')
// module.exports = defineConfig({
//   transpileDependencies: true
// })


// module.exports = {
//   lintOnSave: false,
//   configureWebpack: {
//     mode: process.env.NODE_ENV === 'production' ? 'production' : 'development'
//   }
// };


const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  configureWebpack: {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development'
  },
  publicPath: process.env.NODE_ENV === 'production'
      ? '/lab-profile-training-exam/'
      : '/'
});
// ? '/nlpjapancojp_new/lab-exam/'
