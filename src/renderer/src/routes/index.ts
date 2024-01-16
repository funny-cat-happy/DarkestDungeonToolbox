import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    name: 'index',
    path: '/',
    component: () => import('@renderer/views/archive.vue')
  }
]

const router = createRouter({
  routes,
  history: createWebHashHistory()
})

export default router
