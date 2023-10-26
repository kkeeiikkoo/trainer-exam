<template>
  <div v-if="question">
    <h3 class="question-title" v-html="question.text"></h3>
    <p v-if="!isMultipleChoice">※単一選択</p>

    <!-- <button v-for="(option, index) in question.options" :key="index"
      :class="{ 'option-button-selected': isSelected(index), 'correct-answer': isCorrectAnswer(index), 'wrong-answer': isWrongAnswer(index) }"
      @click="selectOption(index)"
      class="option-button">
      {{ option }}
    </button> -->

    <button v-for="(option, index) in question.options" :key="index"
      :class="{ 'option-button-selected': isSelected(index) }"
      @click="selectOption(index)"
      class="option-button">
      {{ option }}
      <span v-if="isCorrectAnswer(index)">
        <svg class="option-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="#4CAF50" stroke-width="4" fill="none" />
        </svg>
      </span>
      <span v-if="isWrongAnswer(index)">
        <svg class="option-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <line x1="5" y1="5" x2="19" y2="19" stroke="#F44336" stroke-width="4" />
          <line x1="19" y1="5" x2="5" y2="19" stroke="#F44336" stroke-width="4" />
        </svg>
      </span>
    </button>


    <p>質問番号（テスト用）：{{question.id}}</p>

  </div>
</template>

<script>
  export default {
    props: {
      question: {
        type: Object,
        required: true,
      },
      showAnswer: {
        type: Boolean,
        default: false,
      },
      reset: {
        type: Boolean,
        default: false,
      },
    },

    data() {
      return {
        selectedOption: null,
        selectedOptions: [],
        // showAnswer: false,
      };
    },

    // 這段代碼用來清除選擇的狀態
    watch: {
      showAnswer(newVal, oldVal) {
        if (!newVal && oldVal) { // 如果 showAnswer 从 true 变为 false
          this.selectedOptions = [];
        }
      },
      reset: {
        handler(newVal, oldVal) {
          if (newVal && !oldVal) {
            this.selectedOptions = [];
          }
        },
        immediate: true,
      },
    },

    computed: {
      // 如果答案是數組，則會返回true
      isMultipleChoice() {
        return this.question.multipleChoice;
      },
    },
    methods: {

      selectOption(index) {
        if (!this.showAnswer) {
          if (this.isMultipleChoice) {
            // 如果是多选题，可以选中多个选项
            const pos = this.selectedOptions.indexOf(index);
            if (pos === -1) {
              // 选项未被选中，将其添加到选中的数组中
              this.selectedOptions.push(index);
            } else {
              // 选项已被选中，从数组中移除
              this.selectedOptions.splice(pos, 1);
            }
          } else {
            // 如果是单选题，只能选中一个选项
            this.selectedOptions = [index];
          }
        }
        this.$emit('answerSelected', this.selectedOptions);
      },

      isSelected(index) {
        return this.selectedOptions.includes(index);
      },
      isCorrectAnswer(index) {
        return this.showAnswer && (this.isMultipleChoice ? this.question.correctAnswer.includes(index) : this.question.correctAnswer === index);
      },
      isWrongAnswer(index) {
        return this.showAnswer && this.isSelected(index) && !(this.isCorrectAnswer(index));
      },
    },
  };
</script>




<style scoped>

.question-title{
  font-size: 26px;
  font-weight: bold;
  max-width: 600px;
  margin: 50px auto 40px;
}

@media screen and (max-width: 480px) {
  .question-title{
      margin: 40px auto 20px;
    font-size: 20px;
  }
}


  .option-button {
    margin: 10px auto;
    min-height: 40px;
    padding: 10px 20px;
    font-size: 17px;
    border: none;
    border-radius: 4px;
    background-color: #e4f1ff;
    transition: background-color 0.3s ease;
    width: 400px;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media screen and (max-width: 768px) {
    .option-button {
      width: 60%;
    }
  }

  @media screen and (max-width: 480px) {
    .option-button {
      width: 80%;
      font-size: 16px;
    }
  }

  .option-button:hover {
    background-color: #AABECF;
    cursor: pointer;
  }

  .option-button-selected {
    background-color: #8fb2de;
    color: #fff;
  }

  .option-icon {
    width: 24px;
    height: 24px;
    margin-left: 5px;
    display: inline-block;
  }

  /* .correct-answer {
    background-color: blue;
    color: white;
  }

  .wrong-answer {
    background-color: red;
    color: white;
  } */
</style>