<template>
  <el-container>
    <the-aside></the-aside>
    <the-main></the-main>
  </el-container>
</template>

<script>
import TheAside from '~/components/TheAside'
import TheMain from '~/components/TheMain'

export default {
  components: {
    TheAside,
    TheMain
  }
}
</script>

<style lang="scss" scoped>
.el-container {
  padding: 0 15px 0 15px;
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: 20px auto 20px;
  grid-gap: 0 15px;
  grid-template-areas:
    '..... ....'
    'aside main'
    '..... ....';
}
</style>
