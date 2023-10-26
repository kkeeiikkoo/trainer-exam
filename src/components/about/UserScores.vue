<template>
  <div>
    <label for="name">名前：</label>
    <input type="text" id="name" v-model="name" />
    <button :disabled="isButtonDisabled" @click="fetchScores">確認</button>


    <!-- 學生用 -->
    <div v-if="scores.name && userExists">
      <h2>完成確認</h2>
      <table>
        <thead>
          <tr>
            <th>名前 | </th>
            <th>進捗状況 | </th>
            <th>完成状態</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ scores.name }}</td>
            <td>{{ scores.percentage }}%</td>
            <td>{{ scores.isPassed ? '完成' : '未完成' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="red" v-if="!userExists">※名前は存在しない</div>


    <!-- 教師用 -->
    <div v-if="scores.length > 0">
      <h2>完成結果</h2>
      <table>
        <thead>
          <tr>
            <th>名前 | </th>
            <th>分數類型 | </th>
            <th>進捗状況 | </th>
            <th>完成状態</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(score, index) in scores" :key="index">
            <td>{{ score.name }}</td>
            <td>{{ score.scoreType }}</td>
            <td>{{ score.percentage }}%</td>
            <td>{{ score.isPassed ? '完成' : '未完成' }}</td>
          </tr>
        </tbody>
      </table>

      <h2 style="margin-top:3rem">試験を完成した受講生：</h2>
        <p v-for="student in passedStudentsList" :key="student">{{ student }}</p>
    </div>
  </div>
</template>

<script>
  import {
    mapActions,
    mapState,
    mapGetters,
  } from 'vuex';

  export default {
    data() {
      return {
        name: '',
        scores: [],
        // password: '111',
        userExists: true,
      };
    },
    computed: {
      ...mapState(['currentPercentage']),
      ...mapGetters(['teacherPassword', ]),

      isButtonDisabled() {
        return this.name.trim() === '';
      },
      isPassed() {
        return this.currentPercentage === 100;
      }
    },
    methods: {
      ...mapActions([
        'fetchExistingUserScores',
        'fetchAllUserScores',
        'calculateCorrectPercentage', // 新添加的
      ]),

      // 用來確認答題情況的邏輯
      async fetchScores() {
        if (this.name.trim() !== '') {
          if (this.name === this.teacherPassword) {
            const allScores = await this.fetchAllUserScores();
            const passedStudents = {}; // 追踪通过所有测试的学生

            this.scores = [];
            for (const [scoreType, userScores] of Object.entries(allScores)) {
              for (const [name, scores] of Object.entries(userScores)) {
                this.$store.commit('setUserScores', scores);
                this.calculateCorrectPercentage();

                // 追蹤學生通過考試的
                if (this.$store.state.currentPercentage === 100) {
                  if (!passedStudents[name]) {
                    passedStudents[name] = 0;
                  }
                  passedStudents[name]++;
                }

                this.scores.push({
                  name: name,
                  scoreType: scoreType,
                  percentage: this.$store.state.currentPercentage,
                  isPassed: this.$store.state.currentPercentage === 100
                });
              }
            }

            // 只选择通过所有测试的学生
            this.passedStudentsList = Object.keys(passedStudents).filter(name => passedStudents[name] === 3);
          } else {
            // 如果不是特殊的教师账户或密码，只获取当前输入名字的用户的分数
            const userScores = await this.$store.dispatch('fetchExistingUserScores', this.name);

            if (userScores === null) {
              this.userExists = false;
            } else {
              this.userExists = true;
              await this.calculateCorrectPercentage();
              this.scores = {
                name: this.name,
                percentage: this.$store.state.currentPercentage,
                isPassed: this.$store.state.currentPercentage === 100
              };
            }
          }
        }
      }

    }
  };
</script>

<style scoped>
  button {
    margin-left: 0.5rem;
  }

  table {
    margin: auto;
  }

  .red {
    color: #cc0000
  }
</style>