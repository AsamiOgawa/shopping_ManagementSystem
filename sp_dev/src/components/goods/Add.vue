<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 卡片头部区域 -->
      <el-alert title="添加商品信息" type="info" show-icon center :closable="false"></el-alert>
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
        class="fs-12"
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 卡片主体区域 -->
      <el-form
        :model="addGoodsForm"
        :rules="addGoodsFormRules"
        ref="addGoodsFormRef"
        label-width="80px"
        label-position="top"
      >
        <!-- 卡片左侧 tabs 区域 -->
        <el-tabs
          :tab-position="tabPosition"
          v-model="activeIndex"
          :before-leave="beforeLeaveEvent"
          @tab-click="handleClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price" required>
              <el-input-number
                v-model="addGoodsForm.goods_price"
                controls-position="right"
                :min="1"
                class="num-left"
              ></el-input-number>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight" required>
              <el-input-number
                v-model="addGoodsForm.goods_weight"
                controls-position="right"
                :min="1"
                class="num-left"
              ></el-input-number>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number" required>
              <el-input-number
                v-model="addGoodsForm.goods_number"
                controls-position="right"
                :min="1"
                class="num-left"
              ></el-input-number>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addGoodsForm.goods_cat"
                :options="goodsCateData"
                :props="cascaderProps"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item1.attr_name"
              v-for="item1 in this.manyTableData"
              :key="item1.attr_id"
            >
              <el-checkbox-group v-model="item1.attr_vals">
                <el-checkbox v-for="(item2, i) in item1.attr_vals" :key="i" :label="item2" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in this.onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              list-type="picture-card"
              :on-preview="handlePictureCardPreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              :headers="headerObj"
            >
              <i class="el-icon-plus"></i>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addGoodsForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btn-mt" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 查看图片展示框区域 -->
    <el-dialog :visible.sync="showImgVisible">
      <img width="100%" :src="dialogImageUrl" alt />
    </el-dialog>
  </div>
</template>

<script>
import qs from 'qs'
import _ from 'lodash'

export default {
  data() {
    return {
      // 激活的步骤索引
      activeIndex: '0',
      // 左侧 tabs 标签
      tabPosition: 'left',

      // 添加商品表单对象
      addGoodsForm: {
        goods_name: '',
        goods_cat: [],
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_introduce: '',
        pics: [],
        attrs: []
      },
      // 添加商品表单对象验证规则
      addGoodsFormRules: {
        goods_name: [
          { required: true, message: '商品名称不能为空', trriger: 'blur' }
        ],
        goods_price: [
          {
            required: true,
            type: 'number',
            message: '商品价格不能为空',
            trriger: 'blur'
          }
        ],
        goods_weight: [
          {
            required: true,
            type: 'number',
            message: '商品重量不能为空',
            trriger: 'blur'
          }
        ],
        goods_number: [
          {
            required: true,
            type: 'number',
            message: '商品数量不能为空',
            trriger: 'blur'
          }
        ],
        goods_cat: [
          {
            required: true,
            type: 'array',
            message: '商品分类不能为空',
            trriger: 'blur'
          }
        ]
      },

      // 商品分类数据
      goodsCateData: [],
      // 级联选择器对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },

      // 注意：这里之所以要划分参数和属性两个表格数据，是因为商品属性表格中，需要用到 input 元素，input 绑定的数据源要求是 string 或 number ，如果引用同 1 个数据源的话，当点击商品参数时，itme_vals 值为 Array, 就算我们不点击商品属性，也为报出 *Invalid prop: type check failed for prop "value". Expected String, Number, got Array.* 的错误
      // 商品参数表格数据
      manyTableData: [],
      // 商品属性表格数据
      onlyTableData: [],

      // 上传图片路径
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 上传图片时设置请求头，因为使用 upload 组件是它自己内部调用 ajax 请求，不会使用 main.js 已设置的 axios
      headerObj: {
        Authorization: sessionStorage.getItem('token')
      },
      // 默认关闭图片展示框
      showImgVisible: false,
      // 图片展示框的图片路径
      dialogImageUrl: ''
    }
  },
  created() {
    this.getCategoriesList()
  },
  methods: {
    // 获取商品分类列表
    async getCategoriesList() {
      const { data: result } = await this.$http.get('/categories')
      if (result.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败！')
      }
      this.goodsCateData = result.data
    },

    // 切换标签页前触发的事件
    beforeLeaveEvent(newActiveIndex, oldActiveIndex) {
      var prohibitSwitchTab
      this.$refs.addGoodsFormRef.validate(valid => {
        if (!valid) {
          prohibitSwitchTab = false
        }
      })
      return prohibitSwitchTab
    },

    // 切换 tabs 触发事件
    async handleClick() {
      if (this.activeIndex === '1') {
        const { data: result } = await this.$http.get(
          `/categories/${this.CateID}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        if (result.meta.status !== 200)
          return this.$message.error('获取商品参数失败！')
        result.data.forEach(item => {
          if (item.attr_vals === '') return
          item.attr_vals = item.attr_vals.split(' ')
        })
        this.manyTableData = result.data
      }
      if (this.activeIndex === '2') {
        const { data: result } = await this.$http.get(
          `/categories/${this.CateID}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        if (result.meta.status !== 200)
          return this.$message.error('获取商品属性失败！')
        this.onlyTableData = result.data
      }
    },

    // 点击文件列表中已上传的文件时的钩子
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.showImgVisible = true
    },

    // 文件列表移除文件时的钩子
    handleRemove(file) {
      // 1. 获取图片路径
      const filePath = file.response.data.tmp_path
      // 2. 找到 pics 数组中对应 filePath 的索引值
      const i = this.addGoodsForm.pics.findIndex(x => x.pic === filePath)
      // 3. 从 pics 数组中删除对应的索引值
      this.addGoodsForm.pics.splice(i, 1)
    },

    // 文件上传成功时的钩子
    handleSuccess(response) {
      // 组织拼接一个对象，并 push 到 pics 数组中
      const picInfo = { pic: response.data.tmp_path }
      this.addGoodsForm.pics.push(picInfo)
    },

    // 点击添加按钮，添加商品
    async addGoods() {
      const form = _.cloneDeep(this.addGoodsForm)
      form.goods_cat = form.goods_cat.join(',')
      // 处理商品动态参数
      this.manyTableData.forEach(item => {
        if (typeof item.attr_vals === 'object') {
          item.attr_vals = item.attr_vals.join(' ')
        }
        const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
        this.addGoodsForm.attrs.push(newInfo)
      })
      // 处理商品静态属性
      this.onlyTableData.forEach(item => {
        if (typeof item.attr_vals === 'object') {
          item.attr_vals = item.attr_vals.join(' ')
        }
        const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
        this.addGoodsForm.attrs.push(newInfo)
      })
      form.attrs = this.addGoodsForm.attrs
      // 发送 post 请求，添加商品
      const { data: result } = await this.$http.post(
        '/goods',
        qs.stringify(form),
        {
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )
      if (result.meta.status !== 201)
        return this.$message.error('添加商品失败！')
      this.$message.success('添加商品成功！')
      this.$router.push('/goods')
    }
  },
  computed: {
    CateID() {
      return this.addGoodsForm.goods_cat[this.addGoodsForm.goods_cat.length - 1]
    }
  }
}
</script>

<style lang="less" scoped>
.el-alert {
  margin-bottom: 15px;
}
.el-steps {
  margin-bottom: 10px;
}
.el-input-number,
.el-cascader {
  width: 100%;
}
.el-checkbox {
  margin: 0 10px 10px 0 !important;
}

.btn-mt {
  margin-top: 15px;
}
</style>