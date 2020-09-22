import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../views/Login.vue')
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../views/Home.vue')
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')
const Users = () => import(/* webpackChunkName: "users_roles_rights" */ '../components/user/Users.vue')
const Roles = () => import(/* webpackChunkName: "users_roles_rights" */ '../components/power/Roles.vue')
const Rights = () => import(/* webpackChunkName: "users_roles_rights" */ '../components/power/Rights.vue')
const Goods = () => import(/* webpackChunkName: "goods_categories_params_add" */ '../components/goods/Goods.vue')
const Categories = () => import(/* webpackChunkName: "goods_categories_params_add" */ '../components/goods/Categories.vue')
const Params = () => import(/* webpackChunkName: "goods_categories_params_add" */ '../components/goods/Params.vue')
const Add = () => import(/* webpackChunkName: "goods_categories_params_add" */ '../components/goods/Add.vue')
const Orders = () => import(/* webpackChunkName: "orders_reports" */ '../components/orders/Orders.vue')
const Reports = () => import(/* webpackChunkName: "orders_reports" */ '../components/reports/Reports.vue')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/roles', component: Roles },
      { path: '/rights', component: Rights },
      { path: '/goods', component: Goods },
      { path: '/categories', component: Categories },
      { path: '/params', component: Params },
      { path: '/add', component: Add },
      { path: '/orders', component: Orders },
      { path: '/reports', component: Reports }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  // 目标为login，直接放行
  if (to.path === '/login') return next()
  // 判断用户是否已登录，如果未登录，强行跳转登录页面
  const tokenStr = sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
