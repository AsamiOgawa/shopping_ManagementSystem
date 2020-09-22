<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <div class="logo">
          <img src="../assets/logo.jpg" />
        </div>
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 控制菜单栏展开或收缩 -->
        <div class="toggle-button" @click="isOpenList">|||||</div>
        <el-menu
          background-color="#323744"
          text-color="#fff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
        >
          <!-- 一级菜单列表 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单列表 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
            >
              <template>
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-container>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      iconObj: {
        '125': 'iconfont icon-users',
        '103': 'iconfont icon-role',
        '101': 'iconfont icon-commodity',
        '102': 'iconfont icon-order',
        '145': 'iconfont icon-ico-data'
      },
      isCollapse: false
    }
  },
  created() {
    this.getMenuList()
  },
  methods: {
    logout() {
      sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList() {
      const { data: result } = await this.$http.get('/menus')
      if (result.meta.status !== 200)
        return this.$message.error(result.meta.msg)
      this.menuList = result.data
    },
    isOpenList() {
      this.isCollapse = !this.isCollapse
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;

  .el-header {
    background-color: #373c41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    > div {
      display: flex;
      align-items: center;
      .logo {
        width: 50px;
        height: 50px;
        cursor: pointer;
        border-radius: 50%;
        overflow: hidden;
        > img {
          width: 50px;
        }
      }
      span {
        margin-left: 12px;
        font-size: 21px;
        color: #fff;
        font-family: Arial;
      }
    }
  }
  .el-aside {
    background-color: #323744;
    > .toggle-button {
      font-size: 12px;
      background-color: #485164;
      text-align: center;
      line-height: 25px;
      color: #fff;
      cursor: pointer;
    }
    > .el-menu {
      border-right: 0;
      > .el-submenu .iconfont {
        margin-right: 10px;
      }
    }
  }
  .el-main {
    background-color: #eaedf2;
  }
}
</style>