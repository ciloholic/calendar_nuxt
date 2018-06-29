<template>
  <div
    v-loading.fullscreen.lock="loading"
    element-loading-text="Loading..."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)">
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters(['loading'])
  },
  methods: {
    ...mapActions(['SET_LOADING']),
    start() {
      this.SET_LOADING({ loading: true })
    },
    finish() {
      this.SET_LOADING({ loading: false })
    }
  }
}
</script>
