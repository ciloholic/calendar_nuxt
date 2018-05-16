export default function({ store, route, redirect }) {
  if (!store.getters.isLogin && route.name !== 'login') redirect('/login')
  if (store.getters.isLogin && route.name === 'login') redirect('/')
}
