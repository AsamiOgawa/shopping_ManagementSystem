<template>
  <div class="box">
    <div class="container">
      <div class="avatar_box">
        <img src="../assets/avatar.jpg" />
      </div>
      <div class="login_form">
        <el-form :model="loginForm" :rules="loginFormRules" ref="loginFormRef" label-width="0">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" type="password" prefix-icon="iconfont icon-lock"></el-input>
          </el-form-item>
          <el-form-item class="btn">
            <el-button type="primary" @click="login">登录</el-button>
            <el-button type="info" @click="loginFormReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import qs from 'qs'

export default {
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: 'blur' }
        ]
      }
    }
  },

  methods: {
    loginFormReset() {
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      this.$refs.loginFormRef.validate(async validate => {
        if (!validate) return
        const { data: result } = await this.$http.post(
          '/login',
          qs.stringify(this.loginForm),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        )
        if (result.meta.status !== 200)
          return this.$message.error('用户名或密码错误')
        sessionStorage.setItem('token', result.data.token)
        this.$message.success('登录成功')
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.box {
  height: 100%;
  background-color: #2b4b6b;
}
.container {
  width: 404px;
  height: 278px;
  background-color: #fdfefd;
  border-radius: 4px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  .avatar_box {
    width: 112px;
    height: 112px;
    box-shadow: 0 0 10px #efefef;
    border-radius: 50%;
    background-color: #fdfefd;
    margin: 0 auto;
    transform: translate(0px, -57px);
    padding: 10px;
    overflow: hidden;

    img {
      width: 100%;
      background-color: #d6d6d6;
      box-shadow: 0 0 12px #d3cfcf;
      border-radius: 50%;
    }
  }

  .login_form {
    width: 100%;
    position: absolute;
    top: 50%;
    transform: translate(0, -25%);
    padding: 0 20px;
    box-sizing: border-box;

    .btn {
      display: flex;
      flex-direction: row-reverse;
    }
  }
}
</style>