<template>
  <div class="staff">
    <h2>【スタッフ用】受講生の名前登録：</h2>
    <div class="input-group">
      <label for="name">名前を入力してください：</label>
      <input class="mb-half" type="text" id="name" v-model="name" required />
      <button class="mb-half" @click="saveName">名前を保存</button>


      <button class="red-button mb-half" @click="deleteUser(name)">削除</button>


      <div v-if="nameNeeded" class="red">名前を入力してください！</div>

      <div v-if="userNotFound">
        <div class="red">※名前は存在しない</div>
      </div>
    </div>

    <h2 style="margin-top:3rem">登録してある受講生：</h2>
    <tbody>
      <tr v-for="(score, index) in scores" :key="index">
        <td style="line-height:1.65">{{ score.name }}</td>
      </tr>
    </tbody>

  </div>
</template>

<script>
  import {
    mapActions
  } from 'vuex';


  export default {
    data() {
      return {
        name: '',
        nameNeeded: false,
        scores: [],
        userExists: true,
        userNotFound: false,
      };
    },
    components: {},

    methods: {
      ...mapActions([
        'fetchUserScores',
        'fetchAllUserScoresStuff',
      ]),
      async saveName() {
        if (this.name.trim() !== '') {
          const allScoreTypes = ['scores', 'scores2', 'scores3'];

          for (const scoreType of allScoreTypes) {
            // 为每个 score type 执行操作
            await this.$store.dispatch('fetchUserScores', {
              username: this.name,
              scoreType
            });
          }

          this.initializeData()
        } else {
          this.nameNeeded = true
        }
      },


      async initializeData() {
        const allUserScores = await this.fetchAllUserScoresStuff();

        this.scores = Object.entries(allUserScores).map(([name, userScores]) => {
          this.$store.commit('setUserScores', userScores);

          return {
            name: name,
          };
        });
      },

      async deleteUser() {

        if (!this.name || this.name.trim() === '') {
          this.nameNeeded = true;
          return;
        }
        const confirmed = window.confirm(`本当に ${this.name} を削除しますか？`);
        if (confirmed) {
          await this.$store.dispatch('deleteUser', this.name);
          this.userNotFound = this.$store.state.userNotFound; // 更新本地的 userNotFound 變量
        }
        this.initializeData()
      },

    },

    created() {
      this.initializeData()
    },
  };
</script>



<style scoped>
  .mb-half {
    margin-bottom: 1rem;
  }

  .staff {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
  }

  label {
    margin-bottom: 0.5rem;
  }

  .red {
    color: #cc0000;
  }

  button {
    background-color: #3498db;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
  }

  button:hover {
    background-color: #2980b9;
  }

  .red-button {
    background-color: #cc0000;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
  }

  .red-button:hover {
    background-color: #b30000;
  }
</style>