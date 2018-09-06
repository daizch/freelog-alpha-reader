import VueRouter from 'vue-router'
import Vue from 'vue'
import Chapter from './pages/chapter.vue'
import List from './pages/list.vue'

Vue.use(VueRouter)

const routes = [ {
  path: '/',
  component: List
}, {
  path: '/volume/:volumeIndex/chapter/:chapterIndex',
  component: Chapter
}]

const router = new VueRouter({
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  },
  routes
});

export default router

