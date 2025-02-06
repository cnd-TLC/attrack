import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/mobile',
      name: 'mobile',
      component: () => import('@/views/MobileAttendance.vue'),
    },
    {
      path: '/generate-id',
      name: 'generate',
      component: () => import('@/views/IDGeneration.vue'),
    }
  ]
})

export default router
