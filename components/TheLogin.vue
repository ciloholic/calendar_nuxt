<template>
  <el-main>
    <a class="signin_btn" @click="doLogin">
      <img src="~/static/btn_google_signin.png">
    </a>
  </el-main>
</template>

<script>
import auth from '~/plugins/auth'
import { mapGetters, mapActions } from 'vuex'

export default {
  async mounted() {
    if (process.browser) {
      this.setLoading({ loading: true })
      let user
      if (!this.user) user = await auth()
      this.user ? Promise.resolve() : this.$store.dispatch('SET_USER', { user: user })
      this.setLoading({ loading: false })
    }
  },
  computed: {
    ...mapGetters(['user'])
  },
  methods: {
    ...mapActions({ login: 'LOGIN', setUser: 'SET_USER', setLoading: 'SET_LOADING' }),
    doLogin() {
      this.login()
        .then(() => console.log('resloved'))
        .catch(err => console.error(err))
    }
  }
}
</script>

<style lang="scss" scoped>
.el-main {
  grid-area: login;
  display: flex;
  justify-content: center;
  align-items: center;

  .signin_btn {
    display: block;
    width: 200px;
    height: 48px;

    &:hover {
      opacity: 0.8;
    }

    &:active {
      transform: translate3d(0, 3px, 0);
    }
  }
}
</style>
