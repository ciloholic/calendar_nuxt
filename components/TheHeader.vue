<template>
  <el-header height="100vh">
    <ul>
      <li>
        <nuxt-link to="/"><img src="/calendar.png">稼働入力</nuxt-link>
      </li>
    </ul>
  </el-header>
</template>

<style lang="scss" scoped>
.el-header {
  background: #dd8a61;
  grid-area: header;
  padding: 0;

  a {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #332a25;
    width: 80px;
    height: 80px;
    text-decoration: none;
    font-size: 11px;
    letter-spacing: 2px;

    img {
      display: block;
      margin-bottom: 10px;
      width: 30%;
    }
  }

  a.active,
  a:hover {
    background: rgba(0, 0, 0, 0.3);
  }
}
</style>
