<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 卡片头部区域 -->
      <el-row>
        <el-col :span="8">
          <el-input
            v-model="queryInfo.query"
            placeholder="请输入订单编号"
            class="input-with-select"
            clearable
            @clear="reload"
          >
            <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="tableData" style="width: 100%" border stripe>
        <el-table-column type="index" label="#">
          <template
            v-slot="slotsProps"
          >{{ (queryInfo.pagenum - 1) * queryInfo.pagesize + (slotsProps.$index + 1)}}</template>
        </el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="342px"></el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="80px"></el-table-column>
        <el-table-column prop="order_pay" label="是否付款" width="80px">
          <template v-slot="slotsProps">
            <el-tag type="success" v-if="slotsProps.row.order_pay==='1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="80px"></el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="200px">
          <template v-slot="slotsProps">{{slotsProps.row.create_time | dateFormat }}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="slotsProps">
            <el-tooltip
              class="item"
              effect="dark"
              content="修改订单地址"
              placement="top-start"
              :enterable="false"
            >
              <el-button type="primary" size="mini" @click="showEditVisible(slotsProps.row)">
                <i class="el-icon-edit"></i>
              </el-button>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="物流信息"
              placement="top-start"
              :enterable="false"
            >
              <el-button type="success" size="mini" @click="showKuaidiVisible(slotsProps.row)">
                <i class="el-icon-location"></i>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 展示修改订单地址对话框 -->
    <el-dialog title="修改订单地址" :visible.sync="editVisible" width="50%" @closed="reset">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="addr1">
          <el-cascader v-model="editForm.addr1" :options="citydata" :props="props"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="addr2">
          <el-input v-model="editForm.addr2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 展示物流信息对话框 -->
    <el-dialog title="查看物流信息" :visible.sync="kuaidiVisible" width="50%">
      <el-timeline reverse="reverse">
        <el-timeline-item
          v-for="(activity, index) in kuaidiInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import citydata from './citydata.js'

export default {
  data() {
    return {
      tableData: [],
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      editVisible: false,
      editForm: {
        addr1: [],
        addr2: ''
      },
      editFormRules: {
        addr1: [
          {
            required: true,
            message: '请选择省市区/县',
            type: 'array',
            trriger: 'blur'
          }
        ],
        addr2: [
          {
            required: true,
            message: '请填写详细的物流地址',
            trriger: 'blur'
          }
        ]
      },
      citydata,
      props: {
        expandTrigger: 'hover',
        value: 'value',
        label: 'label',
        children: 'children'
      },
      kuaidiVisible: false,
      kuaidiInfo: []
    }
  },
  created() {
    this.getOrdersList()
  },
  methods: {
    // 获取订单列表
    async getOrdersList() {
      const { data: result } = await this.$http.get('/orders', {
        params: this.queryInfo
      })
      if (result.meta.status !== 200)
        return this.$message.error('获取订单列表失败！')
      this.tableData = result.data.goods
      this.total = result.data.total
    },
    // 搜索商品
    search() {
      this.queryInfo.pagenum = 1
      this.getOrdersList()
    },
    // 清空搜索框内容
    reload() {
      this.queryInfo.query = ''
      this.getOrdersList()
    },
    // 展示修改订单地址对话框
    showEditVisible(row) {
      this.editVisible = true
    },
    // 关闭对话框重置订单详细地址
    reset() {
      this.$refs.editFormRef.resetFields()
    },
    // 展示物流信息对话框
    async showKuaidiVisible(row) {
      const { data: result } = await this.$http.get(`/kuaidi/1106975712662`)

      if (result.meta.status !== 200)
        return this.$message.error('获取物流信息失败！')
      this.kuaidiInfo = result.data
      this.kuaidiVisible = true
      console.log(result.data)
    },
    // 改变每页大小
    handleSizeChange(ps) {
      this.queryInfo.pagenum = 1
      this.queryInfo.pagesize = ps
      this.getOrdersList()
    },
    // 改变当前页
    handleCurrentChange(pn) {
      this.queryInfo.pagenum = pn
      this.getOrdersList()
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>