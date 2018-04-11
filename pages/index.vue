<template>
  <el-container>
    <the-header></the-header>
    <the-aside></the-aside>
    <the-main></the-main>
  </el-container>
</template>

<script>
import TheHeader from '~/components/TheHeader'
import TheAside from '~/components/TheAside'
import TheMain from '~/components/TheMain'

export default {
  components: {
    TheHeader,
    TheAside,
    TheMain
  }
}
</script>

<style lang="scss" scoped>
.el-container {
  background: #332a25;
  width: 100vw;
  height: 100vh;
  padding-right: 15px;
  display: grid;
  grid-template-columns: 80px 240px 1fr;
  grid-template-rows: 20px auto 20px;
  grid-gap: 0 15px;
  grid-template-areas:
    'header ..... ....'
    'header aside main'
    'header ..... ....';
}
</style>
