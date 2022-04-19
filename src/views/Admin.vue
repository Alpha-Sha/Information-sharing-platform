<template>
  <div class="home">
    <h1 class="title">管理员界面</h1>
    <div class="" style="margin-top: 30px" v-if="operator">
      <h2>操作员功能</h2>
      <!-- <el-input style="width: 200px; margin-right: 10px" v-model="inputAddress" placeholder="输入地址"></el-input> -->
      <el-button type="primary" @click="handleUpdateUserVisible">更新用户信息</el-button>
    </div>
    <div class="" style="margin-top: 30px" v-if="owner">
      <h2>管理员功能</h2>
      <el-input style="width: 200px; margin-right: 10px" v-model="input2Address" placeholder="输入地址"></el-input>
      <el-button type="primary" @click="handleOperator(true)">设置为操作者</el-button>
      <el-button type="danger" @click="handleOperator(false)">取消操作者</el-button>
    </div>
    <el-dialog title="更新用户信息" :visible.sync="userVisible" width="800px" top="5vh">
      <el-form :model="form" :inline="true" class="demo-form-inline" label-position="left" label-width="100px">
        <el-form-item label="地址">
          <el-input v-model="form.address"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-input v-model="form.sex"></el-input>
        </el-form-item>
        <el-form-item label="名字">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.telephone"></el-input>
        </el-form-item>
        <el-form-item label="介绍">
          <el-input v-model="form.introduce"></el-input>
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="form.email"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleUpdateUser">确认</el-button>
      </span>
    </el-dialog>
    <el-dialog title="View user information" :visible.sync="queryUserVisible" width="500px">
      <div>Address: {{ queryForm.address }}</div>
      <div>User Id: {{ queryForm.uid }}</div>
      <div>Name: {{ queryForm.name }}</div>
      <div>Role: {{ queryForm.role }}</div>
      <div>Telephone: {{ queryForm.telephone }}</div>
      <div>Sex: {{ queryForm.sex }}</div>
      <div>Email: {{ queryForm.email }}</div>
      <div>Preferred trading method: {{ queryForm.like }}</div>
      <div>Introduce: {{ queryForm.introduce }}</div>
      <div>Is whiteList: {{ queryForm.whiteList ? 'YES' : 'NO' }}</div>
    </el-dialog>
  </div>
</template>
<script>
import { getMarketContract } from '@/utils/contractHelp';
import { mapState } from 'vuex';
import { gasProcessing } from '@/utils/format';
export default {
  name: 'Admin',
  components: {},
  computed: {
    ...mapState([
      'account',
      'provider',
      // ...
    ]),
  },

  data() {
    return {
      owner: false, //是否管理员
      inputAddress: '',
      input2Address: '',
      form: {
        address: '',
        name: '',
        telephone: '',
        role: '',
        sex: '',
        email: '',
      },
      queryForm: {
        address: '',
        name: '',
        telephone: '',
        role: '',
        sex: '',
        email: '',
      },
      queryUserVisible: false,
      userVisible: false,
      operator: false,
    };
  },
  async created() {
    this.getOwner();
    this.getOperator();
  },
  beforeDestroy() {},
  mounted() {},
  watch: {
    account() {
      this.getOwner();
      this.getOperator();
    },
  },
  methods: {
    async getOperator() {
      if (!this.account) {
        return;
      }
      console.log(this.account, 'this.account');
      const marketContract = getMarketContract();
      this.operator = await marketContract.methods.operators(this.account).call();
    },
    handleCancel() {
      this.userVisible = false;
      this.form = {
        address: '',
        name: '',
        telephone: '',
        role: '',
        sex: '',
        email: '',
      };
    },
    handleUpdateUserVisible() {
      this.userVisible = true;
    },
    async handleQueryUser() {
      const marketContract = getMarketContract();
      const user = await marketContract.methods.users(this.inputAddress).call();
      this.queryUserVisible = true;
      this.queryForm = { ...user, address: this.inputAddress };
    },

    // 更新用户信息
    async handleUpdateUser() {
      const marketContract = getMarketContract(this.provider);
      try {
        const { address, name, telephone, sex, email, introduce } = this.form;
        const gas = await marketContract.methods.updateUser(address, sex, introduce, name, telephone, email, true).estimateGas({ from: this.account });
        marketContract.methods
          .updateUser(address, sex, introduce, name, telephone, email, true)
          .send({ from: this.account, gas: gasProcessing(gas) })
          .on('transactionHash', hash => {
            this.userVisible = false;
          })
          .on('receipt', receipt => {
            this.$message.success('更新成功');
            this.getOwner();
          });
      } catch (e) {
        console.log(e, 'e');
        this.$message.error(e.message || e + '');
      }
    },
    // 设置操作员
    async handleOperator(status) {
      const marketContract = getMarketContract(this.provider);
      try {
        const gas = await marketContract.methods.setOperator(this.input2Address, status).estimateGas({ from: this.account });
        await marketContract.methods.setOperator(this.input2Address, status).send({ from: this.account, gas: gasProcessing(gas) });
        this.$message.success('设置成功');
        this.getOperator();
        //this.getWhiteList();
        this.getOwner();
      } catch (e) {
        this.$message.error(e.message || e + '');
      }
    },
    async getOwner() {
      if (!this.account) {
        return;
      }

      const marketContract = getMarketContract();
      const owner = await marketContract.methods.owner().call();
      this.owner = owner == this.account;
    },
  },
};
</script>

<style lang="less" scoped>
.home {
  width: 1090px;
  margin: 0 auto;
  color: #333;
  font-size: 12px;
  .logo {
    width: 150px;
  }
  .title {
    margin-top: 20px;
  }
  .menuWrap {
    margin-top: 10px;
    display: flex;
    align-items: center;
    .menuItem {
      cursor: pointer;
      badvertisement: 1px solid rgb(17, 131, 238);
      margin-right: 10px;
      padding: 5px 10px;
      badvertisement-radius: 5px;
    }
    .active {
      background: rgb(17, 131, 238);
      color: #fff;
    }
  }
  .inputWrap {
    margin-top: 10px;
    display: flex;
    align-items: center;
  }
  .list {
    display: flex;
    flex-wrap: wrap;
  }
  .topInfo {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    line-height: 30px;
    width: 350px;
    border: 1px solid #999;
    padding: 10px;
    margin: 20px 20px 0 0;
    .advertisementImg {
      height: 200px;
      width: 200px;
      margin: 0 auto;
      display: inline-block;
    }
    &:nth-child(3n) {
      margin-right: 0;
    }
  }
}
</style>
