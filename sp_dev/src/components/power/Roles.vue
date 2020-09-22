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
      <!-- 添加角色区域 -->
      <el-button type="primary" class="addRoles" @click="showDialogRoles">添加角色</el-button>
      <!-- 展示角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 向下展示角色所对应的权限，包括一级权限、二级权限和三级权限 -->
        <el-table-column type="expand">
          <template v-slot="slotsProp">
            <!-- 循环一级权限菜单 -->
            <el-row
              v-for="(item1, i1) in slotsProp.row.children"
              :key="item1.id"
              :class="['vcenter', 'ebb', i1==0?'ebt':'']"
            >
              <el-col :span="5">
                <el-tag
                  type="primary"
                  closable
                  @close="removeRight(slotsProp.row, item1.id)"
                >{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <!-- 循环二级权限菜单 -->
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="['vcenter', i2==0?'':'ebt']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRight(slotsProp.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 循环三级权限菜单 -->
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRight(slotsProp.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="slotsProp">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightsDialog(slotsProp.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- dialog 添加角色区域 -->
    <el-dialog title="添加角色" :visible.sync="addRolesVisible" width="50%">
      <el-form
        :model="addRoleForm"
        :rules="addRoleFormRules"
        ref="addRoleFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- dialog 分配角色权限区域 -->
    <el-dialog title="分配权限" :visible.sync="setRightsVisible" width="50%" @close="resetLeafkey">
      <!-- 树形控件节点 -->
      <el-tree
        :data="rightsListTree"
        :props="treeProps"
        show-checkbox
        default-expand-all
        node-key="id"
        :default-checked-keys="leafKey"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import qs from 'qs'
export default {
  data() {
    return {
      // 初始化角色列表
      rolesList: [],
      // 初始化角色表单
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 设置角色表单规则
      addRoleFormRules: {
        roleName: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ]
      },
      // 初始化以树形节点的方式获取权限列表
      rightsListTree: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 初始化第三级权限节点id
      leafKey: [],
      // 设置dialog默认关闭状态
      addRolesVisible: false,
      setRightsVisible: false,
      // 初始化角色ID
      roleID: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: result } = await this.$http.get('roles')
      if (result.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      } else {
        this.rolesList = result.data
      }
    },
    showDialogRoles() {
      this.addRolesVisible = true
    },
    addRole() {
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) {
          this.addRolesVisible = true
          return
        } else {
          const { data: result } = await this.$http.post(
            '/roles',
            qs.stringify(this.addRoleForm),
            { header: { 'Content-Type': 'application/x-www-form-urlencoded' } }
          )
          if (result.meta.status !== 201) {
            return this.$message.error('创建角色失败')
          } else {
            this.$message.success(`创建"${this.addRoleForm.roleName}"角色成功`)
            this.getRolesList()
            this.addRolesVisible = false
          }
        }
      })
    },
    async removeRight(role, rightId) {
      // 返回值是promise，需要通过await来解决
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return
      } else {
        const { data: result } = await this.$http.delete(
          `roles/${role.id}/rights/${rightId}`
        )
        if (result.meta.status !== 200) {
          return this.$message.error('删除权限失败！')
        } else {
          this.$message.success('删除权限成功!')
          role.children = result.data
        }
      }
    },
    // 展示分配权限对话框，并以接收树形结构的当前角色权限数据
    async showSetRightsDialog(role) {
      this.roleID = role.id
      const { data: result } = await this.$http.get('rights/tree')
      if (result.meta.status !== 200) {
        return this.$message.error('获取当前角色权限数据失败')
      } else {
        this.rightsListTree = result.data
      }
      this.getLeafKey(role, this.leafKey)
      this.setRightsVisible = true
    },
    // 判断当前角色的节点是否位于第三级权限节点，如果是则直接返回节点的id，保存至leafKey数组中
    getLeafKey(node, arr) {
      if (!node.children) return arr.push(node.id)
      node.children.forEach(item => this.getLeafKey(item, arr))
    },
    // 关闭分配权限对话框时重置leafKey数组，防止对话框叠加上一个角色已拥有的权限
    resetLeafkey() {
      this.leafKey = []
    },
    // 分配当前角色权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')

      const { data: result } = await this.$http.post(
        `/roles/${this.roleID}/rights`,
        qs.stringify({ rids: idStr }),
        {
          header: { 'Content-type': 'application/x-www-form-urlencoded' }
        }
      )
      if (result.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      } else {
        this.$message.success('分配权限成功！')
        this.getRolesList()
      }
      this.setRightsVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
.addRoles {
  margin-bottom: 15px;
}
.el-tag {
  margin: 7px;
}
.ebt {
  border-top: 1px solid #eee;
}
.ebb {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
  margin-bottom: 0;
}
</style>