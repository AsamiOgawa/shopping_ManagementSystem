<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false" class="mg-b"></el-alert>
      <!-- 选择商品分类区域 -->
      <div class="mg-b">
        选择商品分类：
        <el-cascader
          v-model="selectedCate"
          :options="categoriesList"
          :props="receiveProps"
          @change="handleChange"
          clearable
        ></el-cascader>
      </div>
      <!-- 标签页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 动态参数区域 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="small"
            class="mg-b"
            :disabled="isBtnDisabled"
            @click="showAddVisible"
          >添加参数</el-button>
          <el-table :data="cateParams" style="width: 100%" border stripe>
            <el-table-column type="expand">
              <template v-slot="slotsProps">
                <!-- 展示当前属性所有用的标记 -->
                <el-tag
                  v-for="(item, i) in slotsProps.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(slotsProps.row)"
                >{{item}}</el-tag>
                <!-- 添加标记按钮 -->
                <el-input
                  class="input-new-tag"
                  v-if="slotsProps.row.inputVisible"
                  v-model="slotsProps.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slotsProps.row)"
                  @blur="handleInputConfirm(slotsProps.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(slotsProps.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="slotsProps">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditPramsDialog(slotsProps.row)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="delParams(slotsProps.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性区域 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="small"
            class="mg-b"
            :disabled="isBtnDisabled"
            @click="showAddVisible"
          >添加属性</el-button>
          <el-table :data="cateParams" style="width: 100%" border stripe>
            <el-table-column type="expand">
              <template v-slot="slotsProps">
                <!-- 展示当前属性所有用的标记 -->
                <el-tag
                  v-for="(item, i) in slotsProps.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(slotsProps.row)"
                >{{item}}</el-tag>
                <!-- 添加标记按钮 -->
                <el-input
                  class="input-new-tag"
                  v-if="slotsProps.row.inputVisible"
                  v-model="slotsProps.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slotsProps.row)"
                  @blur="handleInputConfirm(slotsProps.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(slotsProps.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="slotsProps">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditPramsDialog(slotsProps.row)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="delParams(slotsProps.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 对话框区域 -->
    <div>
      <!-- 添加动态参数/静态属性区域 -->
      <el-dialog
        :title="'添加' + addParamsText"
        :visible.sync="addVisible"
        @close="closeAddDialog"
        width="50%"
      >
        <!-- 表单区域 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
          <el-form-item :label="addParamsText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <!-- 操作区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addVisible = false">取 消</el-button>
          <el-button type="primary" @click="addAttr">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑动态参数/静态属性区域 -->
      <el-dialog
        :title="'编辑' + addParamsText"
        :visible.sync="editParamsVisible"
        width="50%"
        @close="resetEditParamsForm"
      >
        <!-- 表单区域 -->
        <el-form
          :model="editParamsForm"
          :rules="editParamsFormRules"
          ref="editParamsFormRef"
          label-width="80px"
        >
          <el-form-item label="动态参数" prop="attr_name">
            <el-input v-model="editParamsForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <!-- 操作区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editParamsVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams()">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import qs from 'qs'

export default {
  data() {
    return {
      // 商品分类数据
      categoriesList: [],
      // 接收的商品分类数据
      receiveProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 已选择的商品分类
      selectedCate: [],
      // 设置默认展示的标签页
      activeName: 'many',
      cateParams: [],
      // 设置添加动态参数/静态属性对话框默认为关闭状态
      addVisible: false,
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: '此处不能为空',
            trriger: 'blur'
          },
          {
            max: 20,
            message: '最大20个字符',
            trriger: 'blur'
          }
        ]
      },
      // 设置编辑动态参数/静态属性的对话框默认为关闭状态
      editParamsVisible: false,
      // 编辑动态参数/静态属性的表单数据
      editParamsForm: {},
      // 设置动态参数/静态属性的表单规则
      editParamsFormRules: {
        attr_name: [
          { required: true, message: '动态参数名不能为空', trriger: 'blur' },
          { max: 20, message: '动态参数名最大20个字符', trriger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCategoriesList()
  },
  methods: {
    // 获取商品分类数据列表
    async getCategoriesList() {
      const { data: result } = await this.$http.get('/categories')
      if (result.meta.status !== 200) {
        return this.$message.error('获取商品分类数据列表失败！')
      } else {
        this.categoriesList = result.data
      }
    },
    // 获取商品分类的动态参数或静态属性
    async getCateParams() {
      const { data: result } = await this.$http.get(
        `/categories/${this.categoriesID}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      if (result.meta.status !== 200) {
        return this.$message.error('获取商品分类参数失败！')
      } else {
        // 1. 首先将后台发过来的字符串遍历为数组，因为字符串以空格('')区分不同标记tag，所以分割时需要用到空格
        result.data.forEach(item => {
          // 2. 由于可能存在空标记，即''，也会被转换为空数组（[""]），所以需要在转换前判断当前attr_vals是否为空
          item.attr_vals ? (item.attr_vals = item.attr_vals.split(' ')) : ''
          // 3. 将保存每一行不同的 inputVisible 和 inputValue ，防止控死所有行的 +new tags 按钮
          item.inputVisible = false
          item.inputValue = ''
        })
        this.cateParams = result.data
      }
    },
    // 监听级联选择器是否选中选项
    handleChange() {
      if (this.selectedCate.length === 0) {
        this.cateParams = []
        return
      }
      this.getCateParams()
    },
    // 监听改变标签页事件
    handleClick() {
      if (this.isBtnDisabled) return
      this.getCateParams()
    },
    // 点击编辑参数按钮弹出对话框
    showEditPramsDialog(params) {
      this.editParamsForm = params
      this.editParamsVisible = true
    },
    // 关闭对话框时，重置动态参数表单数据
    resetEditParamsForm() {
      this.$refs.editParamsFormRef.resetFields()
      this.getCateParams()
    },
    // 点击确定按钮，修改动态参数名称
    editParams() {
      this.$refs.editParamsFormRef.validate(async valid => {
        if (!valid) {
          return
        } else {
          let p = this.editParamsForm
          const { data: result } = await this.$http.put(
            `/categories/${p.cat_id}/attributes/${p.attr_id}`,
            qs.stringify({
              attr_name: p.attr_name,
              attr_sel: p.attr_sel,
              attr_vals: p.attr_vals
            }),
            { header: { 'Content-Type': 'application/x-www-form-urlencoded' } }
          )
          if (result.meta.status !== 200) {
            return this.$message.error('修改动态参数失败！')
          } else {
            this.$message.success('修改动态参数成功！')
            this.getCateParams()
            this.editParamsVisible = false
          }
        }
      })
    },
    // 点击添加参数/属性按钮，展示对话框
    showAddVisible() {
      this.addVisible = true
    },
    // 关闭添加参数/属性对话框，重置表单数据和校验结果
    closeAddDialog() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定按钮，添加动态参数或静态属性
    addAttr() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return
        } else {
          const { data: result } = await this.$http.post(
            `/categories/${this.categoriesID}/attributes`,
            qs.stringify({
              attr_name: this.addForm.attr_name,
              attr_sel: this.activeName
            }),
            { header: { 'Content-Type': 'application/x-www-form-urlencoded' } }
          )
          if (result.meta.status !== 201) {
            return this.$message.error(`添加${this.addParamsText}失败`)
          } else {
            this.$message.success(`添加${this.addParamsText}成功`)
            this.addVisible = false
            this.getCateParams()
          }
        }
      })
    },
    // 点击删除按钮，删除动态参数或静态属性
    async delParams(params) {
      const isConfirm = await this.$confirm(
        `此操作将永久删除该${this.addParamsText}, 是否继续?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (isConfirm === 'cancel') return
      const { data: result } = await this.$http.delete(
        `/categories/${params.cat_id}/attributes/${params.attr_id}`
      )
      if (result.meta.status !== 200) {
        return this.$message.error(`删除${this.addParamsText}失败`)
      } else {
        this.$message.success(`删除${this.addParamsText}成功`)
        this.getCateParams()
      }
    },
    // 点击 +new tag 按钮时展示input输入框
    showInput(row) {
      row.inputVisible = true
      // $nextTick 的作用：当页面上的元素重新被渲染时，执行回调函数里面的代码
      // console.log(this.$refs.saveTagInput)    结果为 undefined
      this.$nextTick(() => {
        // 聚焦代码放在这里是因为 input 的引用对象在被重新渲染前，是不存在的，即渲染前 input 仍处于 disabled 状态，所以需要借助 $nextTick 方法，在页面重新渲染后才能拿到 input 输入框的对象
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 失去焦点或按下 enter 键触发事件
    async handleInputConfirm(row) {
      row.inputVisible = false
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        return
      }
      if (typeof row.attr_vals === 'string') {
        row.attr_vals = []
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      const { data: result } = await this.$http.put(
        `/categories/${row.cat_id}/attributes/${row.attr_id}`,
        qs.stringify({
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }),
        { header: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      )
      if (result.meta.status !== 200) {
        return this.$message.error(`添加标记失败！`)
      } else {
        this.$message.success(`添加标记成功！`)
      }
    },
    // 删除展开行的标记
    async handleClose(row) {
      row.attr_vals.splice(row.attr_vals.indexOf(row), 1)
      const { data: result } = await this.$http.put(
        `/categories/${row.cat_id}/attributes/${row.attr_id}`,
        qs.stringify({
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }),
        { header: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      )
      if (result.meta.status !== 200) {
        return this.$message.error(`删除标记失败`)
      } else {
        this.$message.success(`删除标记成功`)
      }
    }
  },
  computed: {
    // 判断级联选择器是否有选择商品分类，以判断是否激活添加（参数/属性）按钮
    isBtnDisabled() {
      if (this.selectedCate.length === 0) {
        return true
      } else {
        return false
      }
    },
    // 通过级联选择器获取商品分类id
    categoriesID() {
      if (this.selectedCate.length === 0) {
        return null
      } else {
        return this.selectedCate[this.selectedCate.length - 1]
      }
    },
    // 根据当前标签页名称返回对应的文本值
    addParamsText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.mg-b {
  margin-bottom: 15px;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>