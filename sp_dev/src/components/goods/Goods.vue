<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 卡片头部区域 -->
      <el-row>
        <!-- 搜索区域 -->
        <el-col :span="8" class="mg-r">
          <el-input
            placeholder="请输入内容"
            v-model="queryParams.query"
            class="input-with-select"
            clearable
            @clear="clearSearchText"
          >
            <el-button slot="append" icon="el-icon-search" @click="searchGoods"></el-button>
          </el-input>
        </el-col>
        <!-- 添加商品区域 -->
        <el-col :span="6">
          <el-button type="primary" @click="goAddGoods">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 卡片表格区域 -->
      <el-table :data="goodsListData" border stripe style="width: 100%">
        <el-table-column type="index" label="#">
          <template
            v-slot="slotsProps"
          >{{ (queryParams.pagenum - 1) * queryParams.pagesize + slotsProps.$index + 1}}</template>
        </el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="95px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="70px"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="140px">
          <template v-slot="slotsProps">{{slotsProps.row.add_time | dateFormat }}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template v-slot="slotsProps">
            <el-button type="primary" class="el-icon-edit" size="mini"></el-button>
            <el-button
              type="danger"
              class="el-icon-delete"
              size="mini"
              @click="delGoods(slotsProps.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.pagenum"
        :page-sizes="[5, 10, 20]"
        :page-size="queryParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 头部搜索框的内容
      searchText: '',

      // 商品列表数据对象
      goodsListData: [],

      // 查询商品列表参数
      queryParams: { query: '', pagenum: 1, pagesize: 5 },

      // 初始化商品列表总条数
      total: 0
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表
    async getGoodsList() {
      const { data: result } = await this.$http.get('/goods', {
        params: this.queryParams
      })
      if (result.meta.status !== 200)
        return this.$message.error('获取商品列表失败！')
      this.goodsListData = result.data.goods
      this.total = result.data.total
    },

    // 输入商品名称，搜索相关商品
    searchGoods() {
      this.queryParams.pagenum = 1
      this.getGoodsList()
    },
    // 清空输入框搜索商品名称，重新获取完整的商品列表
    clearSearchText() {
      this.queryParams.pagenum = 1
      this.getGoodsList()
    },
    // 点击添加商品按钮，页面跳转到添加商品组件
    goAddGoods() {
      this.$router.push('/add')
    },

    // 点击删除商品按钮，删除商品
    async delGoods(row) {
      const confirm = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirm === 'cancel') return
      const { data: result } = await this.$http.delete(`/goods/${row.goods_id}`)
      if (result.meta.status !== 200) {
        return this.$message.error('删除商品失败！')
      } else {
        this.$message.success('删除商品成功！')
        this.getGoodsList()
      }
    },

    // 改变每页大小时所触发的事件
    handleSizeChange(ps) {
      this.queryParams.pagesize = ps
      this.getGoodsList()
    },
    // 改变当前页时所触发的事件
    handleCurrentChange(pn) {
      this.queryParams.pagenum = pn
      this.getGoodsList()
    }
  }
}
</script>

<style lang="less" scoped>
.mg-r {
  margin-right: 20px;
  > .input-with-select {
    margin-bottom: 15px;
  }
}
</style>