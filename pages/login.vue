<template>
  <el-container>
    <the-login></the-login>
  </el-container>
</template>

<script>
import TheLogin from '~/components/TheLogin'

export default {
  components: {
    TheLogin
  }
}
</script>

<style lang="scss" scoped>
.el-container {
  display: grid;
  grid-template-columns: 1fr 500px 1fr;
  grid-template-rows: auto 300px auto;
  grid-template-areas:
    '. ..... .'
    '. login .'
    '. ..... .';
}
</style>
