import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/dashboard-main',
      name: 'dashboard-main',
      component: () => import('../views/dashboard-main.vue')
    },
    {
      path: '/green-house',
      name: 'green-house',
      component: () => import('../views/green-house.vue')
    },
    {
      path: '/green-house-form',
      name: 'green-house-form',
      component: () => import('../views/green-house-form.vue')
    },
    {
      path: '/env-info',
      name: 'env-info',
      component: () => import('../views/env-info.vue')
    },
    {
      path: '/seed-list',
      name: 'seed-list',
      component: () => import('../views/seed-list.vue')
    },
    {
      path: '/seed-list-form',
      name: 'seed-list-form',
      component: () => import('../views/seed-list-form.vue')
    },
    {
      path: '/seed-gallery',
      name: 'seed-gallery',
      component: () => import('../views/seed-gallery.vue')
    },
    {
      path: '/seed-gallery-form',
      name: 'seed-gallery-form',
      component: () => import('../views/seed-gallery-form.vue')
    },
    {
      path: '/plant-list',
      name: 'plant-list',
      component: () => import('../views/plant-list.vue')
    },
    {
      path: '/plant-list-form',
      name: 'plant-list-form',
      component: () => import('../views/plant-list-form.vue')
    },
    // {
    //   path: '/plant-irrigation',
    //   name: 'plant-irrigation',
    //   component: () => import('../views/plant-irrigation.vue')
    // },
    // {
    //   path: '/plant-fertilize',
    //   name: 'plant-fertilize',
    //   component: () => import('../views/plant-fertilize.vue')
    // },
    // {
    //   path: '/plant-pesticide',
    //   name: 'plant-pesticide',
    //   component: () => import('../views/plant-pesticide.vue')
    // },
    // {
    //   path: '/plant-disease',
    //   name: 'plant-disease',
    //   component: () => import('../views/plant-disease.vue')
    // },
    {
      path: '/sensor-list',
      name: 'sensor-list',
      component: () => import('../views/sensor-list.vue')
    },
  ]
})

export default router
