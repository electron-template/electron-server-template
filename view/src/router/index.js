import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  base: '/',
  routes: [
    {
      path: '/',
      component: () => import('../layout/Index.vue'),
      redirect: '/demo/IPCRenderer',
      children: [
        {
          path: 'demo',
          name: 'demo',
          // redirect: '/demo/IPCRenderer',
          children:[
            {
              name:'IPCRenderer',
              path: 'IPCRenderer',
              component: () => import('../views/Demo/IPCRenderer/Index.vue'),
              meta:{
                title:'IPCRenderer通信'
              }
            }
          ]

        }
      ]
    },
    {
      path: '/:pathMatch(.*)',
      redirect: '/' // 重定向到首页
    }
  ]
})

export default router
