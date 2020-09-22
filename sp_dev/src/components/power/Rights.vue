<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <div>
        <el-table :data="rightsList" border stripe>
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column label="权限名称" prop="authName"></el-table-column>
          <el-table-column label="路径" prop="path"></el-table-column>
          <el-table-column label="权限等级" prop="level">
            <template v-slot="slotProps">
              <el-tag v-if="slotProps.row.level==0" type="primary">一级</el-tag>
              <el-tag v-if="slotProps.row.level==1" type="success">二级</el-tag>
              <el-tag v-if="slotProps.row.level==2" type="warning">三级</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rightsList: []
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    async getRightsList() {
      const { data: result } = await this.$http.get('/rights/list')
      if (result.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      } else {
        this.rightsList = result.data
      }
    }
  }
}
</script>

<style lang="less" scoped>
</style>