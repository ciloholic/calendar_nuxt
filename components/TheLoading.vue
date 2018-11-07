<template>
  <div
    v-loading.fullscreen.lock="loading"
    element-loading-text="Loading..."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  ></div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters(['loading'])
  },
  methods: {
    ...mapActions(['setLoading']),
    start() {
      this.setLoading({ loading: true })
    },
    finish() {
      this.setLoading({ loading: false })
    }
  }
}
</script>
