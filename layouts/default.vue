<template>
  <div>
    <nuxt/>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  watch: {
    user: function() {
      if (this.isLogin) {
        this.$router.push('/')
      } else {
        this.$router.push('/login')
      }
    }
  },
  computed: {
    ...mapGetters(['user', 'isLogin'])
  }
}
</script>
