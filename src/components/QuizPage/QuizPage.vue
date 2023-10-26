<template>
  <div>
    <div class="progress-number">{{ currentPercentage.toFixed(0) }}%</div>
    <div class="progress-bar">
      <div class="progress-bar-inner" :style="{width: currentPercentage + '%'}"></div>
    </div>

    <QuizItem
      :reset="reset"
      :question="unansweredQuestionsOnly[currentQuestionIndex]"
      :showAnswer="showAnswer"
      v-if="unansweredQuestionsOnly.length && currentQuestionIndex < unansweredQuestionsOnly.length"
      @answerSelected="handleAnswerSelected" />

    <p class="correct-answer-explanation"
      v-if="showAnswer && unansweredQuestionsOnly.length && currentQuestionIndex < unansweredQuestionsOnly.length">
      【説明】<span v-html="unansweredQuestionsOnly[currentQuestionIndex].correctAnswerExplanation"></span>
    </p>

    <button class="submit-button" @click="submitAnswer" v-if="shouldShowSubmitButton">答えを提出</button>
    <button class="next-button" @click="nextQuestion" v-if="shouldShowNextButton">次の問題</button>
    <button class="result-button" @click="goToResultPage" v-if="shouldShowResultButton">戻る</button>

  </div>
</template>

<script>
  import QuizItem from "./QuizItem.vue";
  import {
    ref,
    set,
    update
  } from 'firebase/database';
  import {
    database
  } from "./firebase-config.js";
  import {
    mapState
  } from 'vuex';
  import {
    questions as questions1
  } from "@/components/QuizPage/questions1.js";
  import {
    questions as questions2
  } from "@/components/QuizPage/questions2.js";
  import {
    questions as questions3
  } from "@/components/QuizPage/questions3.js";

  export default {
    components: {
      QuizItem,
    },
    data() {
      return {
        debouncing: false, //防抖

        loading: true, //確認加載
        questions: [], // 保存所有的题目


        // currentQuestionIndex: 0,
        showAnswer: false,
        selectedOptions: [], // 保存选中的答案
        reset: false, //清除用戶的選擇
      };
    },

    computed: {
      ...mapState(['currentQuestionId', 'unansweredQuestions', 'currentPercentage']),

      currentQuestionIndex() {
        return this.currentQuestionId;
      },

      // 将 questions 过滤，只留下那些未答对两次的题目
      unansweredQuestionsOnly() {

        // return this.questions.filter((_, index) =>
        //   this.unansweredQuestions.includes(index + 1) // 题目的 ID 是从 1 开始的
        // );

        // 隨機題目的排序
        const unanswered = this.questions.filter((_, index) =>
          this.unansweredQuestions.includes(index + 1)
        );
        return unanswered.sort(() => Math.random() - 0.5);
      },
      selectedQuestions() {
        switch (this.$store.state.selectedScoreType) {
          case 'scores':
            return questions1;
          case 'scores2':
            return questions2;
          case 'scores3':
            return questions3;
          default:
            return [];
        }
      },
      // 這段代碼用來決定提出用戶答案
      shouldShowSubmitButton() {
        return !this.showAnswer && this.unansweredQuestionsOnly.length && this.currentQuestionIndex < this.unansweredQuestionsOnly.length;
      },
      // 這段代碼用來決定顯示下一題按鈕
      shouldShowNextButton() {
        return this.showAnswer && this.unansweredQuestionsOnly.length && this.currentQuestionIndex < this.unansweredQuestionsOnly.length;
      },
      // 這段代碼用來決定顯示結果按鈕（當所有題目都回答完畢時）
      shouldShowResultButton() {
        return this.unansweredQuestionsOnly.length === 0;
      },

    },
    watch: {
      selectedQuestions(newQuestions) {
        console.log('New questions set: ', newQuestions);
        this.questions = newQuestions;
      }
    },

    methods: {

      //導航到結果頁面
      goToResultPage() {
        // this.$router.push('/result');
        this.$router.push('/choose-questions');
      },

      handleAnswerSelected(options) {
        this.selectedOptions = options;
      },


      async submitAnswer() {
        if (this.debouncing) {
          return;
        }
        this.debouncing = true;
        setTimeout(() => {
          this.debouncing = false;
        }, 500); // 500毫秒后解除防抖状态

        // 这行代码会取得用户选取的答案（this.selectedOptions），并通过sort()函数将答案进行排序。排序是为了在比较答案时，不因为答案的顺序不同而产生错误的比较结果。
        const selectedAnswers = this.selectedOptions.sort();

        // 获取问题ID
        const questionId = this.unansweredQuestionsOnly[this.currentQuestionIndex].id;

        // 查找问题在数组中的索引
        const questionIndex = this.questions.findIndex(question => question.id === questionId);

        // 获取正确的答案
        let correctAnswers = this.questions[questionIndex].correctAnswer;
        // let correctAnswers = this.questions[this.currentQuestionIndex].correctAnswer;


        // 如果correctAnswers不是数组，则转化为数组
        if (!Array.isArray(correctAnswers)) {
          correctAnswers = [correctAnswers];
        }

        // 这行代码将正确答案进行排序，原因同上
        correctAnswers = correctAnswers.sort();

        // 这行代码将用户选择的答案和正确答案转换成JSON字符串，然后比较这两个字符串是否相等。如果相等，说明用户选择的答案是正确
        const isCorrect = JSON.stringify(selectedAnswers) === JSON.stringify(correctAnswers);


        // 如果答案正确，增加 currentPercentage 的值，達成進度條及時反應的效果
        if (isCorrect) {
          let increasePercentage = (0.5 / this.$store.getters.totalQuestions) * 100;
          let newPercentage = this.$store.state.currentPercentage + increasePercentage;
          this.$store.commit('setCorrectPercentage', newPercentage);
        }

        // question${this.currentQuestionIndex + 1}; 这行代码生成了一个字符串，格式为question加上题目的序号，用于在数据库中标识每一道题目。
        // const questionKey = `question${this.currentQuestionIndex + 1}`;
        const questionKey = `question${this.unansweredQuestionsOnly[this.currentQuestionIndex].id}`;


        // 这段代码检查是否已经设置了用户名。如果用户名没有被设置，那么打印错误信息，并终止函数的执行。
        if (!this.$store.state.username) {
          console.error('Username is not set.');
          return;
        }

        // 这行代码调用Vuex的dispatch函数，执行名为updateUserScore的action，将用户名、
        // 题目的键和是否回答正确的信息传递给这个action。这个action负责将用户的答题结果更新到数据库。
        await this.$store.dispatch('updateUserScore', {
          username: this.$store.state.username,
          questionKey: questionKey,
          isCorrect: isCorrect,
        });

        this.showAnswer = true;

        // 這段是把當前題目ID存入firebase
        // 定義ID為當前題目+1
        const currentQuestionId = this.currentQuestionIndex;

        // 使用 Vuex mutation 更新 currentQuestionId
        // currentQuestionId保存在vuex
        this.$store.commit('setCurrentQuestionId', currentQuestionId);

        // firebase的保存路徑
        const currentQuestionRef = ref(database, `${this.$store.state.selectedScoreType}/${this.$store.state.username}/currentQuestion`);
        await set(currentQuestionRef, this.$store.state.currentQuestionId + 1);
      },


      nextQuestion() {
        // 清空答題狀態
        this.showAnswer = false;

        //清除用戶的選擇
        this.reset = true;
        this.$nextTick(() => {
          this.reset = false;
        });

        // 清空答題狀態
        this.selectedOptions = [];

        // 檢查所有問題是否已回答完畢
        if (
          this.currentQuestionIndex + 1 === this.unansweredQuestionsOnly.length
        ) {
          // 如果所有問題都已經回答完畢，調用restartQuiz方法
          this.$store.dispatch('resetCurrentQuestion');
        } else {

          // 显示下一题的逻辑
          const currentQuestionId = this.currentQuestionIndex + 1;
          // 繼續下一題，把ID提交到vuex
          this.$store.commit('setCurrentQuestionId', currentQuestionId);
        }
      },
    },

    mounted() {
      this.questions = this.selectedQuestions;
    }
  };
</script>

<style scoped>
  button {
    margin-top: 2rem;
    padding: 0.7rem 2rem;
    font-size: 1rem;
  }

  .submit-button {
    background-color: #FF642D;
    color: #fff;
    border: none;
    cursor: pointer;
    border-radius: 5px;
  }

  .submit-button:hover {
    background-color: #e34004;
  }

  .correct-answer-explanation {
       margin: 30px auto 20px;
    border: 1px solid #333;
    padding: 15px;
    max-width: 450px;
  }

  @media screen and (max-width: 480px) {
    .correct-answer-explanation {
      width: 90%;
      padding: 10px;
       margin: 30px auto 10px;
    }
  }


  @media screen and (max-width: 480px) {
    .correct-answer-options {
      padding: 15px;
    }
  }

  .progress-number{
    font-size: 16px;
  }

  .progress-bar {
    display: flex;
    width: 100%;
    max-width: 600px;
    height: 8px;
    background-color: #ddd;
    margin: 0.5rem auto 0;
  }

  .progress-bar-inner {
    height: 100%;
    background-color: #4caf50;
  }

  @media screen and (max-width: 480px) {
    .progress-bar {
      width: 96%;
    }
  }
</style>