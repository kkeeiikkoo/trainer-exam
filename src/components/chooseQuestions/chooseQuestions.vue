<template>

	<div>
		<h2 v-if="$store.state.percentages['scores'] === 100 && 
           $store.state.percentages['scores2'] === 100 && 
           $store.state.percentages['scores3'] === 100">
			おめでとうございます！<br>LABトレトレ合格しました！
		</h2>

		<div class="card-area">
			<div class="card" @click="startSelectedQuiz('scores')"
				:class="{ disabled: $store.state.percentages['scores'] === 100 }">
				【動機づけの特徴】<br> {{ $store.state.percentages['scores'] || 0 }}%<br>
				<div v-if="$store.state.percentages['scores'] === 100">✔️ 完成</div>
			</div>
			<div class="card" @click="startSelectedQuiz('scores2')"
				:class="{ disabled: $store.state.percentages['scores2'] === 100 }">
				【内的処理の特徴】 <br> {{ $store.state.percentages['scores2'] || 0 }}%
				<div v-if="$store.state.percentages['scores2'] === 100">✔️ 完成</div>
			</div>
			<div class="card" @click="startSelectedQuiz('scores3')"
				:class="{ disabled: $store.state.percentages['scores3'] === 100 }">
				【応用編】 <br> {{ $store.state.percentages['scores3'] || 0 }}%
				<div v-if="$store.state.percentages['scores3'] === 100">✔️ 完成</div>
			</div>
		</div>
	</div>
</template>



<script>
	import {
		mapActions
	} from 'vuex';

	export default {
		methods: {
			...mapActions([
				'fetchUserScores',
				'calculateUnansweredQuestions',
				'calculateCorrectPercentage',
				'fetchExistingUserScores',
			]),


			async startSelectedQuiz(selectedScoreType) {

				// 決定使用哪個題目類型
				this.$store.commit('setSelectedScoreType', selectedScoreType);

				// 这里你可以使用之前存储在 Vuex 中的用户名来调用数据库或其他逻辑操作
				const username = this.$store.state.username;

				// 从数据库拉取用户数据并更新状态，主要是爲了获取用户的当前题目
				const existingScores = await this.fetchExistingUserScores(username, selectedScoreType);
				if (existingScores !== null) {
					this.$store.commit('setCurrentQuestionId', existingScores.currentQuestion);
				}

				// 這裡可以添加額外的邏輯，比如從數據庫拉取數據等
				await this.calculateUnansweredQuestions();
				await this.calculateCorrectPercentage(); // 获取答题进度

				this.$store.dispatch('resetCurrentQuestion'); // 重置当前题目

				this.$router.push('/quiz');
			}
		},

		async created() {
			const scoreTypes = ['scores', 'scores2', 'scores3'];
			let newPercentages = {};

			for (const scoreType of scoreTypes) {
				this.$store.commit('setSelectedScoreType', scoreType);

				// 如果需要，这里更新 state.userScores 和 state.totalQuestions
				await this.fetchExistingUserScores(this.$store.state.username, scoreType);

				const percentage = await this.calculateCorrectPercentage();
				if (percentage !== undefined) {
					newPercentages[scoreType] = percentage;
				}
			}
			this.$store.commit('setPercentages', newPercentages);
		}

	}
</script>



<style scoped>
	/* 容器样式 */
	.card-area {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: row;
		gap: 20px;
		/* 卡片之间的间距 */
	}

	@media screen and (max-width: 480px) {
		.card-area {
			flex-direction: column;
		}
	}

	/* 卡片基础样式 */
	.card {
		width: 200px;
		height: 300px;
		background-color: #f1f1f1;
		border: 1px solid #ccc;
		border-radius: 8px;
		display: flex;
		justify-content: center;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
		transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
		/* 添加过渡效果 */
	}

	@media screen and (max-width: 480px) {
		.card {
			width: 80%;
			height: 150px;
		}
	}

	/* 卡片悬停效果 */
	.card:hover {
		transform: scale(1.05);
		/* 放大卡片 */
		box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
		/* 添加阴影 */
	}

	.disabled {
		pointer-events: none;
		background-color: #ccc;

	}
</style>