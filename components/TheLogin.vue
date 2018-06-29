<template>
  <el-main>
    <a v-if="!loading" class="googleSignin" @click="doLogin">
      <img src="~/static/btn_google_signin.png">
    </a>
  </el-main>
</template>

<script>
import auth from '~/plugins/auth'
import { mapGetters, mapActions } from 'vuex'

export default {
  head: {
    title: 'Login'
  },
  async mounted() {
    if (process.browser) {
      this.SET_LOADING({ loading: true })
      let user
      if (!this.user) user = await auth()
      this.user ? Promise.resolve() : this.$store.dispatch('SET_USER', user)
      this.SET_LOADING({ loading: false })
    }
  },
  computed: {
    ...mapGetters(['user', 'loading'])
  },
  methods: {
    ...mapActions(['LOGIN', 'SET_LOADING']),
    doLogin() {
      this.LOGIN()
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

  .googleSignin {
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
