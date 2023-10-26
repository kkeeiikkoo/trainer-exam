<template>
  <div class="login-page">
    <h1 class="lab-title">LABトレーナーズ・トレーニング</h1>
    <p class="lab-sub-title green">トレーナー認定試験</p>
    <div class="input-group">
      <label for="name">名前を入力してください：</label>
      <input class="input" type="text" id="name" v-model="name" required />
    </div>

    <!-- <div class="input-group">
      <label for="scoreType">問題のタイプを選ぶ<br>（３分割のどれを選ぶ）</label>
      <select id="scoreType" v-model="selectedScoreType">
        <option value="scores">問題 1</option>
        <option value="scores2">問題 2</option>
        <option value="scores3">問題 3</option>
      </select>
    </div> -->


    <button class="mb-half start-button" @click="startQuiz">試験開始</button>

    <div v-if="nameNeeded" class="red">名前が存在しません！</div>

    <!-- 測驗的説明 -->
    <div class="quiz-info">
      <h2 style="text-align:center">テストのルール:</h2>
      <ul>
        <li>全問題数は <span class="bold">117問</span> です。</li>
        <li>アセスメント修了の条件：全問題を２回連続して正解するとアセスメント終了します。</li>
        <li>いつでも途中で止めることができ、結果は自動保存されます。</li>
        <li>問題には単一選択と複数選択の２つの形式があります。正解は一つだけの場合もあれば、複数ある場合もあります。</li>
      </ul>
    </div>
  </div>
</template>

<script>
  import {
    mapActions
  } from 'vuex';
  import {
    mapState
  } from 'vuex';

  export default {
    data() {
      return {
        name: '',
        nameNeeded: false,
        selectedScoreType: 'scores',
      };
    },
    computed: {
      ...mapState(['totalQuestions']),
      isButtonDisabled() {
        return this.name.trim() === '';
      },
    },
    methods: {
      ...mapActions([
        // 'fetchUserScores',
        // 'calculateUnansweredQuestions',
        // 'calculateCorrectPercentage',
        'fetchExistingUserScores',
      ]),


      async startQuiz() {
        if (this.name.trim() !== '') {
          // 使用 Vuex action 从数据库中获取该用户名的信息
          const existingScores = await this.fetchExistingUserScores(this.name, this.$store.state.selectedScoreType);

          if (existingScores !== null) {
            // 用户存在于数据库中
            this.$store.commit('setUsername', this.name.trim()); // 存储用户名到 Vuex
      
            this.$router.push('/choose-questions'); // 跳转到选择题目页面

            
          } else {
            // 用户不存在于数据库中
            this.nameNeeded = '输入的名字不在数据库中，请检查是否正确';
          }

        } else {
          this.nameNeeded = '名前を入力してください！'; // 名字是必需的
        }
      }


      // async startQuiz() {
      //   if (this.name.trim() !== '') {
      //     // 決定使用哪個題目類型
      //     this.$store.commit('setSelectedScoreType', this.selectedScoreType);

      //     // 使用 Vuex action 从数据库中获取该用户名的信息
      //     const existingScores = await this.fetchExistingUserScores(this.name, this.$store.state.selectedScoreType);

      //     if (existingScores !== null) {
      //       // 用户存在于数据库中
      //       await this.calculateUnansweredQuestions();
      //       await this.calculateCorrectPercentage(); // 获取答题进度
      //       this.$router.push('/quiz');
      //     } else {
      //       // 用户不存在于数据库中
      //       this.nameNeeded = '输入的名字不在数据库中，请检查是否正确';
      //     }
      //   } else {
      //     this.nameNeeded = '名前を入力してください！'; // 名字是必须的
      //   }
      // }

    }
  };
</script>

<style scoped>

.lab-title{
  font-size: 2rem;
  margin-bottom: 0rem;
  text-align: center;
  margin-top: 1rem;

}

 .green{
    color: #1faa6b;
  }

@media screen and (max-width: 480px) {
  .lab-title{
    font-size: 1.4rem;
  }
}

.lab-sub-title{
  font-size: 1.3rem;
  margin-bottom: 3rem;
  margin-top: 0.8rem;
  text-align: center;
  font-weight: 700;
}

@media screen and (max-width: 480px) {
  .lab-sub-title{
    font-size: 1rem;
  }
}

  .mb-half {
    margin-bottom: 1rem;
  }

  .bold {
    font-weight: bold;
  }

  .login-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    font-size: 1rem;
    text-align: left;
  }

  .input{
    padding: 0.5rem;
    font-size: 1.2rem;
  }

  label {
    margin-bottom: 0.5rem;
  }

  .red {
    color: #cc0000;
  }

  .start-button {
    background-color: #3498db;
    color: white;
    margin-top: 1rem;
    padding: 0.7rem 2rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1.1rem;
  }

  .start-button:hover {
    background-color: #2980b9;
  }



  .quiz-info {
    margin-top: 30px;
    padding: 10px 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    text-align: left;
    max-width: 480px;
  }

  .quiz-info h2 {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .quiz-info ul {
    padding-left: 20px;
  }

  .quiz-info ul li {
    margin-bottom: 5px;
  }
</style>