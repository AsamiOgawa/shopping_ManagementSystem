<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 添加分类区域 -->
      <el-button type="primary" class="mg-b" @click="addCategories">添加分类</el-button>
      <!-- 展示分类列表区域 -->
      <el-table
        :data="categoriesList"
        border
        stripe
        style="100%"
        row-key="cat_id"
        :tree-props="{children: 'children'}"
      >
        <el-table-column type="index" label="#" align="center">
          <template v-slot="slotsProps">
            <i class="el-icon-s-help" v-if="slotsProps.row.cat_level==0"></i>
          </template>
        </el-table-column>
        <el-table-column label="分类名称" prop="cat_name"></el-table-column>
        <el-table-column label="是否有效">
          <template v-slot="slotsProps">
            <i
              class="el-icon-success"
              style="color: lightgreen"
              v-if="slotsProps.row.cat_deleted===false"
            ></i>
            <i class="el-icon-error" style="color: red" v-else></i>
          </template>
        </el-table-column>
        <el-table-column label="排序" sortable>
          <template v-slot="slotsProps">
            <el-tag type="primary" v-if="slotsProps.row.cat_level==0">一级</el-tag>
            <el-tag type="success" v-if="slotsProps.row.cat_level==1">二级</el-tag>
            <el-tag type="warning" v-if="slotsProps.row.cat_level==2">三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="slotsProps">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editCategories(slotsProps.row)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleteCategories(slotsProps.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="sizeChange"
        @current-change="currentChange"
        :current-page="reqParams.pagenum"
        :page-sizes="[5, 10, 20]"
        :page-size="reqParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>

      <!-- 对话框区域 -->
      <div>
        <!-- 添加分类对话框 -->
        <el-dialog title="添加分类" :visible.sync="addCateVisible" width="50%" @close="resetAddCate">
          <el-form
            :model="addCateForm"
            :rules="addCateFormRules"
            ref="addCateFormRef"
            label-width="80px"
          >
            <el-form-item label="分类名称" prop="cat_name">
              <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类" prop="cat_level">
              <el-cascader
                v-model="selectdKeys"
                :props="cateProps"
                :options="parentCateList"
                @change="handleChange"
                clearable
                filterable
              ></el-cascader>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addCateVisible = false">取 消</el-button>
            <el-button type="primary" @click="addParentCate">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 编辑分类对话框 -->
        <el-dialog
          title="编辑分类"
          :visible.sync="editCateVisible"
          width="50%"
          @close="resetEditVisible"
        >
          <el-form
            :model="editCateForm"
            :rules="editCateFormRules"
            ref="editCateFormRef"
            label-width="80px"
          >
            <el-form-item label="分类名称" prop="cat_name">
              <el-input v-model="editCateForm.cat_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editCateVisible = false">取 消</el-button>
            <el-button type="primary" @click="editCate">确 定</el-button>
          </span>
        </el-dialog>
      </div>
    </el-card>
  </div>
</template>

<script>
import qs from 'qs'

export default {
  data() {
    return {
      categoriesList: [],
      // 初始化分页信息
      reqParams: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      // 设置对话框默认关闭
      addCateVisible: false,
      // 添加分类表单的数据
      addCateForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      // 设置cat_name表单规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '分类名称不能为空', trriger: 'blur' },
          { max: 20, message: '分类名称最大20个字符', trriger: 'blur' }
        ]
      },
      // 初始化添加分类表单数据
      parentCateList: [],
      // 配置props指定的对象
      cateProps: {
        expandTrigger: 'hover',
        checkStrictly: true,
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类数组id
      selectdKeys: [],
      // 默认关闭编辑分类对话框
      editCateVisible: false,
      // 编辑分类表单数据
      editCateForm: {},
      // 编辑分类中的分类名称规则
      editCateFormRules: {
        cat_name: [
          { required: true, message: '分类名称不能为空', trriger: 'blur' },
          { max: 20, message: '分类名称最大20个字符', trriger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCategoriesList()
  },
  methods: {
    // 获取商品分类列表
    async getCategoriesList() {
      const { data: result } = await this.$http.get('/categories', {
        params: this.reqParams
      })
      if (result.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败！')
      }
      this.categoriesList = result.data.result
      this.total = result.data.total
    },
    // 监听改变分页的每页条数时的事件
    sizeChange(newSize) {
      this.reqParams.pagesize = newSize
      this.reqParams.pagenum = 1
      this.getCategoriesList()
    },
    // 监听改变分页的当前页时的事件
    currentChange(newPage) {
      this.reqParams.pagenum = newPage
      this.getCategoriesList()
    },
    // 点击添加分类时展示对话框
    addCategories() {
      this.cascaderCateList()
      this.addCateVisible = true
    },
    // 关闭添加分类对话框时重置表单数据
    resetAddCate() {
      this.$refs.addCateFormRef.resetFields()
      this.selectdKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 获取商品分类数据列表，用于级联选择器
    async cascaderCateList() {
      const { data: result } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (result.meta.status !== 200) {
        return this.$message.error('获取商品分类数据列表失败！')
      } else {
        this.parentCateList = result.data
      }
    },
    // 监听父级分类一栏是否发生数据变化事件
    handleChange() {
      if (this.selectdKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectdKeys[this.selectdKeys.length - 1]
        this.addCateForm.cat_level = this.selectdKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击确定按钮，监听添加分类事件
    addParentCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: result } = await this.$http.post(
          '/categories',
          qs.stringify(this.addCateForm),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        )
        if (result.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        } else {
          this.$message.success('添加分类成功！')
          this.getCategoriesList()
          this.addCateForm.cat_name = ''
          this.addCateVisible = false
        }
      })
    },
    // 点击编辑分类按钮，展示对话框
    editCategories(cn) {
      this.editCateForm = cn
      this.editCateVisible = true
    },
    // 关闭编辑分类对话框时，重置表单数据和校验结果
    resetEditVisible() {
      this.$refs.editCateFormRef.resetFields()
      this.getCategoriesList()
    },
    // 点击确定按钮，提交已修改好的表单数据
    editCate() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const {
          data: result
        } = await this.$http.put(
          `/categories/${this.editCateForm.cat_id}`,
          qs.stringify({ cat_name: this.editCateForm.cat_name }),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        )
        if (result.meta.status !== 200) {
          return this.$message.error('修改分类名称失败！')
        } else {
          this.$message.success('修改分类名称成功！')
          this.getCategoriesList()
          this.editCateVisible = false
          this.$refs.editCateFormRef.resetFields()
        }
      })
    },
    // 点击删除按钮弹出弹框，询问用户是否继续删除
    async deleteCategories(cid) {
      const confirm = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirm === 'confirm') {
        const { data: result } = await this.$http.delete(
          `/categories/${cid.cat_id}`
        )
        if (result.meta.status !== 200) {
          return this.$message.error('删除分类失败！')
        } else {
          this.$message.success('删除分类成功！')
          this.getCategoriesList()
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.mg-b {
  margin-bottom: 15px;
}
.el-cascader {
  width: 100%;
}
</style>