<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 卡片头部 -->
      <div class="text item">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input placeholder="请输入内容" v-model="reqParams.query" clearable @clear="getUserList">
              <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
            </el-input>
            <div class="grid-content bg-purple"></div>
          </el-col>
          <el-col :span="6">
            <div class="grid-content bg-purple">
              <el-button type="primary" @click="addUserVisible = true">添加用户</el-button>
            </div>
          </el-col>
        </el-row>
      </div>
      <!-- dialog 添加用户区域 -->
      <el-dialog title="添加用户" :visible.sync="addUserVisible" width="50%">
        <el-form
          :model="addUserForm"
          :rules="addUserFormRules"
          ref="addUserFormRef"
          label-width="80px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addUserForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addUserForm.password" type="password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="addUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addUserVisible = false">取 消</el-button>
          <el-button type="primary" @click="reset()">重 填</el-button>
          <el-button type="primary" @click="addUser()">添 加</el-button>
        </span>
      </el-dialog>
      <!-- dialog 编辑用户区域 -->
      <el-dialog title="编辑用户信息" :visible.sync="showEditVisible" width="50%" @close="closeReset">
        <el-form
          :model="editUserForm"
          :rules="editUserFormRules"
          ref="editUserFormRef"
          label-width="80px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editUserForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showEditVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- dialog 删除用户区域 -->
      <el-dialog title="删除用户" :visible.sync="deleteUserVisible" width="50%">
        <span>{{`您确定删除"${delUser.username}"用户吗？`}}</span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="deleteUserVisible = false">取 消</el-button>
          <el-button type="primary" @click="delCurrUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- dialog 分配权限区域 -->
      <el-dialog
        title="分配权限"
        :visible.sync="setRightsVisible"
        width="50%"
        @close="resetSelectedRoleID"
      >
        <div>
          <p class="mg-b">当前的用户：{{this.getUserInfo.username}}</p>
          <p class="mg-b">当前的角色：{{this.getUserInfo.role_name}}</p>
          <p>
            分配新角色：
            <el-select v-model="selectedRoleID" placeholder="请选择">
              <el-option
                v-for="item in roleList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id"
              ></el-option>
            </el-select>
          </p>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightsVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRole">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 卡片展示用户列表区域 -->
      <el-table :data="users" stripe border style="width: 100%">
        <el-table-column type="index" label="#">
          <template v-slot="slotProps">
            <span>{{(reqParams.pagenum - 1) * reqParams.pagesize + slotProps.$index + 1}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="mobile" label="手机号"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="slotProps">
            <el-switch v-model="slotProps.row.mg_state" @change="userStateChange(slotProps.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot="anypropname">
            <!-- 编辑用户的操作区域 -->
            <el-tooltip effect="dark" content="编辑用户" placement="top-start" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="small"
                @click="getEditUser(anypropname.row.id)"
              ></el-button>
            </el-tooltip>
            <!-- 删除用户的操作区域 -->
            <el-tooltip effect="dark" content="删除用户" placement="top-start" :enterable="false">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="small"
                @click="showDelVisible(anypropname.row.id)"
              ></el-button>
            </el-tooltip>
            <!-- 设置权限的操作区域 -->
            <el-tooltip effect="dark" content="设置权限" placement="top-start" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="small"
                @click="showSetRightsVisible(anypropname.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="reqParams.pagenum"
        :page-sizes="[2, 5, 10]"
        :page-size="reqParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
import qs from 'qs'

export default {
  data() {
    // 定义邮箱的校验规则
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^\w+@\w+(\.\w+)+$/
      if (regEmail.test(value)) {
        return callback()
      } else {
        return callback(new Error('请输入合法的邮箱'))
      }
    }
    // 定义手机号码的校验规则
    var checkMobile = (rule, value, callback) => {
      // 定义验证手机号码的正则表达式
      const regMobile = /^1[34578]\d{9}$/
      if (regMobile.test(value)) {
        return callback()
      } else {
        return callback(new Error('请输入合法的手机号码'))
      }
    }

    return {
      reqParams: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      users: [],
      total: 0,
      // 初始化添加用户表单数据与规则
      addUserVisible: false,
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addUserFormRules: {
        username: [
          { required: true, message: '用户名不能为空', trigger: 'blur' },
          {
            min: 3,
            max: 15,
            message: '用户名字符个数为3~15位',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '密码不能为空', trigger: 'blur' },
          { min: 6, max: 32, message: '密码长度为6~32位', trigger: 'blur' }
        ],
        email: [{ validator: checkEmail, trigger: 'blur' }],
        mobile: [
          { required: true, message: '手机号不能为空', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 初始化修改用户表单数据与规则
      showEditVisible: false,
      editUserForm: {},
      editUserFormRules: {
        email: [
          { required: true, message: '邮箱不能为空', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '手机号不能为空', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 初始化弹出删除用户的 dialog
      deleteUserVisible: false,
      delUser: {},
      // 初始化弹出设置权限的 dialog
      setRightsVisible: false,
      // 初始化当前用户的角色与权限信息
      getUserInfo: {},
      // 初始化角色列表
      roleList: [],
      // 双向绑定已选中的角色
      selectedRoleID: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: result } = await this.$http.get('/users', {
        params: this.reqParams
      })
      if (result.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.users = result.data.users
      this.total = result.data.total
    },
    handleSizeChange(newSize) {
      this.reqParams.pagesize = newSize
      this.reqParams.pagenum = 1
      this.getUserList()
    },
    handleCurrentChange(newPage) {
      this.reqParams.pagenum = newPage
      this.getUserList()
    },
    async userStateChange(userState) {
      const { data: result } = await this.$http.put(
        `users/${userState.id}/state/${userState.mg_state}`
      )
      if (result.meta.status !== 200) {
        this.users.mg_state = !this.users.mg_state
        return this.$message.error('修改用户失败')
      }
    },
    search() {
      this.reqParams.pagenum = 1
      this.getUserList()
    },
    reset() {
      this.$refs.addUserFormRef.resetFields()
      this.addUserVisible = true
    },
    // 监听取消或关闭表单时重置已验证的结果和表单数据
    closeReset() {
      this.$refs.editUserFormRef.resetFields()
    },
    // 点击添加按钮确定添加用户
    addUser() {
      this.$refs.addUserFormRef.validate(async valid => {
        if (!valid) {
          this.addUserVisible = true
          return
        }
        const { data: result } = await this.$http.post(
          '/users',
          qs.stringify(this.addUserForm),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        )
        if (result.meta.status !== 201) {
          return this.$message.error(result.meta.msg)
        } else {
          this.addUserVisible = false
        }
      })
    },
    // 获取编辑用户初始化信息
    async getEditUser(id) {
      this.showEditVisible = true
      const { data: result } = await this.$http.get('/users/' + id)
      if (result.meta.status !== 200) {
        return this.$message.error('获取用户信息失败')
      } else {
        this.editUserForm = result.data
      }
    },
    // 确定修改完成用户信息
    editUser() {
      this.$refs.editUserFormRef.validate(async valid => {
        if (!valid) {
          this.showEditVisible = true
          return
        } else {
          const { data: result } = await this.$http.put(
            '/users/' + this.editUserForm.id,
            qs.stringify(this.editUserForm),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
          )
          this.showEditVisible = false
          this.getUserList()
          this.$message.success('修改用户信息成功！')
        }
      })
    },
    // 弹出删除用户 dialog
    async showDelVisible(id) {
      this.deleteUserVisible = true
      const { data: result } = await this.$http.get('/users/' + id)
      if (result.meta.status !== 200) {
        return this.$message.error('获取用户信息失败')
      } else {
        this.delUser = result.data
      }
    },
    // 删除用户操作
    async delCurrUser() {
      const { data: result } = await this.$http.delete(
        '/users/' + this.delUser.id
      )
      if (result.meta.status !== 200) {
        this.$message.error(`"删除${this.delUser.username}失败"`)
      } else {
        this.deleteUserVisible = false
        this.getUserList()
        this.$message.success(`"删除${this.delUser.username}成功"`)
      }
    },
    // 弹出分配权限 dialog
    async showSetRightsVisible(role) {
      // 获取当前用户信息
      this.getUserInfo = role
      // 获取所有角色列表
      const { data: result } = await this.$http.get('/roles')
      if (result.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = result.data
      this.setRightsVisible = true
    },
    // 点击按钮确定分配角色给当前用户
    async allotRole() {
      // 首先判断是否已选择分配的角色，如果没有则需要提示用户选择
      if (!this.selectedRoleID) return this.$message.warning('请选择角色选项')
      const {
        data: result
      } = await this.$http.put(
        `users/${this.getUserInfo.id}/role`,
        qs.stringify({ rid: this.selectedRoleID }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      )
      if (result.meta.status !== 200) {
        return this.$message.error('分配角色失败！')
      } else {
        this.getUserList()
        this.setRightsVisible = false
        return this.$message.success('分配角色成功！')
      }
    },
    // 当关闭分配权限的对话框时，重置已选择的角色选项和用户信息
    resetSelectedRoleID() {
      this.selectedRoleID = ''
      this.getUserInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
.mg-b {
  margin-bottom: 15px;
}
</style>