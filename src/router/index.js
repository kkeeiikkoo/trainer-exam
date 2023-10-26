import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: () => import( '../views/AboutView.vue')   
  },
  {
    path: '/login',
    name: 'login',
    component: () => import( '../views/LoginView.vue')   
  },
  {
    path: '/quiz',
    name: 'quiz',
    component: () => import( '../views/QuizView.vue')   
  },
  {
    path: '/result',
    name: 'result',
    component: () => import( '../views/ResultView.vue')   
  },
  {
    path: '/Staff',
    name: 'Staff',
    component: () => import( '../views/StaffView.vue')   
  },
  {
    path: '/choose-questions',
    name: 'choose-questions',
    component: () => import( '../views/chooseQuestionsView.vue')   
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
