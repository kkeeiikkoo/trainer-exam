import {
  createStore
} from 'vuex';

import {
  ref,
  get,
  set,
  remove,
  update
} from 'firebase/database';
import {
  database
} from '../components/QuizPage/firebase-config';



export default createStore({
  state: {

    selectedScoreType: 'scores', // 默认值，顯示現在選的的哪個模塊。可以是 'scores', 'scores2', 'scores3', ...
    scoreTypeQuestionCount: {
      scores: 43,
      scores2: 48,
      scores3: 26,
    },

    username: null,
    userScores: {}, // 用于存储用户的答题情况
    unansweredQuestions: [], // 用于存储还未答对两次的题目ID
    // totalQuestions: 5, // 題目數量
    teacherPassword: 'nlpjapan5555', //用來確認所有學生答題狀況的密碼

    database: database,

    currentQuestionId: null, //當前的題目，用於退出重進的時候

    currentPercentage: 0, //答題進度
    percentages: {
      scores: 0,
      scores2: 0,
      scores3: 0
    },

    userNotFound: false, //用於判斷用戶是否存在

  },

  // Vuex的getters，可以看作是state的计算属性
  getters: {
    teacherPassword: state => state.teacherPassword,

    totalQuestions: (state) => {
      return state.scoreTypeQuestionCount[state.selectedScoreType] || 0;
    },
  },

  // Vuex的mutations，主要用于修改state
  mutations: {

    // 用于存储所有题目组的答题进度(用於在卡片的頁面顯示進度)
    setPercentages(state, percentages) {
      state.percentages = percentages;
    },

    // 決定顯示哪個模塊的題目
    setSelectedScoreType(state, type) {
      state.selectedScoreType = type;
    },

    setUsername(state, payload) {
      state.username = payload;
    },

    // 这里的两个mutation是用来更新state中对应的状态的。
    // 这两个mutation通过commit方法被调用，其中payload参数就是你想要更新的新状态。

    // setUserScores负责更新用户答题情况的userScores状态，
    setUserScores(state, payload) {
      state.userScores = payload;
    },

    // setUnansweredQuestions负责更新还未答对两次的题目ID的unansweredQuestions状态。
    setUnansweredQuestions(state, payload) {
      state.unansweredQuestions = payload;
    },

    //幫助把用戶的當前答題進度保存
    setCurrentQuestionId(state, id) {
      state.currentQuestionId = id;
    },

    //重置題目
    resetCurrentQuestionId(state) {
      state.currentQuestionId = 0;
    },

    //設置百分比
    setCorrectPercentage(state, payload) {
      state.currentPercentage = payload;
    },

  },

  actions: {

    // 当用户输入他们的名字并开始答题的时候，fetchUserScores这个action将会被调用。
    // 这个action首先尝试从Firebase中获取用户的答题情况，如果用户是第一次答题，
    // 那么就在Firebase中创建一个新的用户对象，同时，
    // 使用setUserScores mutation来更新Vuex中的userScores状态。

    async fetchUserScores({
      state,
      commit
    }, payload) {

      // 這裏payload是一個對象，裏面有username和scoreType兩個屬性
      const username = payload.username;
      const scoreType = payload.scoreType || state.selectedScoreType;

      const userScoresRef = ref(database, `${scoreType}/${username}`);


      // snapshot是从Firebase数据库中获取的用户答题记录
      const snapshot = await get(userScoresRef);


      // 如果用户是第一次答题，数据库中没有用户的数据，那么就创建一个新的用户对象
      // 用户名为username，答题记录scores为空对象
      if (!snapshot.exists()) {
        await set(userScoresRef, {
          username: username,
          scores: {},
          currentQuestion: 0, // 在用户数据创建时设定一个初始的 currentQuestion答題記錄
        });

        // 使用commit调用mutation方法setUserScores来更新state.userScores的状态（此时userScores为空对象）
        commit('setUserScores', {});
        commit('setCurrentQuestionId', 0);

      } else {
        // 如果snapshot存在，即用户在数据库中有答题记录，那么它就使用commit调用mutation方法setUserScores
        // 来更新state.userScores的状态（此时userScores为数据库中用户的答题记录）

        // 打印获取的快照数据
        // console.log(snapshot.val());
        commit('setUserScores', snapshot.val());
        commit('setCurrentQuestionId', snapshot.val().currentQuestion);
      }

      // 设置username
      commit('setUsername', username);
    },




    // 查詢成績用的方法（學生用），另外這個方法也在登錄頁面使用
    async fetchExistingUserScores({
      commit,
      state
    }, username) {

      // 根据 state 中的 selectedScoreType 动态设置路径
      const userScoresRef = ref(database, `${state.selectedScoreType}/${username}`);
      const snapshot = await get(userScoresRef);

      if (!snapshot.exists()) {
        return null;
      } else {
        commit('setUserScores', snapshot.val());
        commit('setCurrentQuestionId', snapshot.val().currentQuestion);
        return snapshot.val(); // 确保返回这个对象
      }
      commit('setUsername', username);
    },




    async deleteUser({
      commit,
      state,
      dispatch
    }, username) {
      const allScoreTypes = ['scores', 'scores2', 'scores3']; // 这里定义了所有的分数类型
      for (const scoreType of allScoreTypes) {
        // 针对每一个 scoreType 执行删除操作
        await dispatch('deleteUserScores', {
          username,
          scoreType
        });
      }
    },

    async deleteUserScores({
      commit,
      state
    }, {
      username,
      scoreType
    }) {
      // 获取用户数据的引用
      const userScoresRef = ref(database, `${scoreType}/${username}`);

      // 检查该用户是否存在
      const snapshot = await get(userScoresRef);
      if (!snapshot.exists()) {
        // 如果用户不存在，返回 null 或者做其他处理
        state.userNotFound = true;
        return null;
      }

      // 删除用户
      await remove(userScoresRef);
      state.userNotFound = false;
      // 如果需要，你也可以在这里调用其他 commit 方法来更新 Vuex 的状态
    },




    // 查詢成績用的方法（工作人員用）
    async fetchAllUserScoresStuff({
      commit
    }) {
      const scoresRef = ref(database, 'scores');

      const snapshot = await get(scoresRef);

      if (snapshot.exists()) {
        const allUserScores = snapshot.val();
        // 这里假设 allUserScores 是一个包含所有用户分数的对象，其中每一个属性是一个用户名，
        // 对应的值是该用户的得分
        for (const username in allUserScores) {
          // 为每一个用户提交他们的得分
          commit('setUserScores', allUserScores[username]);
          commit('setCurrentQuestionId', allUserScores[username].currentQuestion);
        }
        return allUserScores;
      } else {
        throw new Error('No scores found in the database');
      }
    },

    // 查詢成績用的方法（教師用）
    async fetchAllUserScores({
      commit
    }) {
      const allScoreTypes = ['scores', 'scores2', 'scores3'];
      let allScores = {};

      for (const scoreType of allScoreTypes) {
        const scoresRef = ref(database, `${scoreType}`);

        const snapshot = await get(scoresRef);

        if (snapshot.exists()) {
          const userScores = snapshot.val();
          allScores[scoreType] = userScores;
        } else {
          throw new Error(`No ${scoreType} found in the database`);
        }
      }

      return allScores;
    },




    // 计算还未答对两次的题目ID，并使用setUnansweredQuestions mutation来
    // 更新Vuex中的unansweredQuestions状态
    async calculateUnansweredQuestions({
      state,
      getters,
      commit
    }) {
      const unansweredQuestions = []; //保存哪些题目没有被用户答对两次

      // 遍历每一个可能的题目ID（从1到getters.totalQuestions，即总的题目数量）。
      // 对于每一个题目ID，它检查state.userScores中是否存在该题目的记录，以及如果存在记录，
      // 是否答对次数小于2。如果该题目没有记录，或者答对次数小于2，它就把题目ID添加到unansweredQuestions数组中
      for (let i = 1; i <= getters.totalQuestions; i++) {
        const questionKey = `question${i}`;
        if (!state.userScores[questionKey] || state.userScores[questionKey] < 2) {
          unansweredQuestions.push(i);
        }
      }

      // 将unansweredQuestions数组中的题目ID随机排序
      // unansweredQuestions.sort(() => Math.random() - 0.5);

      // 使用commit调用mutation方法setUnansweredQuestions来更新state.unansweredQuestions的状态，即保存还未答对两次的题目ID
      commit('setUnansweredQuestions', unansweredQuestions);
    },


    // 计算答题进度，并使用setPercentages mutation来更新Vuex中的percentages状态
    async calculateCorrectPercentage({
      state,
      getters,
      commit
    }) {
      let correctCount = 0;

      // 遍历每一个可能的题目ID（从1到getters.totalQuestions，即总的题目数量）。
      // 对于每一个题目ID，它检查state.userScores中是否存在该题目的记录，以及如果存在记录，
      // 是否答对次数大于或等于2。如果该题目的答对次数大于或等于2，那么就把答对题目的数量加1
      for (let i = 1; i <= getters.totalQuestions; i++) {
        const questionKey = `question${i}`;
        if (state.userScores[questionKey]) {
          if (state.userScores[questionKey] >= 2) {
            correctCount += 1;
          } else if (state.userScores[questionKey] === 1) {
            correctCount += 0.5;
          }
        }
      }

      const correctPercentage = parseFloat((correctCount / getters.totalQuestions * 100).toFixed(1));
      // 使用commit调用mutation方法setCorrectPercentage来更新state.correctPercentage的状态
      commit('setCorrectPercentage', correctPercentage);

      return correctPercentage;
    },






    // 重置currentQuestionId
    // 答題完成之後歸零
    async resetCurrentQuestion({
      dispatch,
      commit,
      state
    }) {
      // 使用mutation来重置currentQuestionId
      commit('resetCurrentQuestionId');

      // 获取Firebase中的用户答题记录的引用
      const userScoresRef = ref(database, `${state.selectedScoreType}/${state.username}`);

      // 将新的currentQuestionId值推送到Firebase
      await update(userScoresRef, {
        currentQuestion: state.currentQuestionId
      });

      // 獲取最新的數據
      // await dispatch('fetchUserScores', state.username);
      await dispatch('fetchUserScores', { username: state.username });


      // 按照最新的數據去跑程序，過濾不需要的題目
      await dispatch('calculateUnansweredQuestions');

    },


    // 答題的邏輯。答對加分，答錯不加分
    async updateUserScore({
      commit,
      state
    }, {
      username,
      questionKey,
      isCorrect
    }) {

      const db = state.database; // 获取Firebase实例引用

      // 获取用户的分数
      const userScoreRef = ref(db, `${state.selectedScoreType}/${username}/${questionKey}`);

      // 读取当前分数
      let currentScore = await get(userScoreRef);
      currentScore = currentScore.exists() ? currentScore.val() : 0;


      // 如果回答正确，则将分数增加1
      const additionalScore = isCorrect ? 1 : 0;

      // 更新Firebase的数据
      await set(userScoreRef, currentScore + additionalScore);
    },

  },

  modules: {},
});