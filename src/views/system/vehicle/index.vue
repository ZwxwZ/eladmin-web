<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">来源</label>
        <el-input v-model="query.source" clearable size="small" placeholder="来源" style="width: 185px;" class="filter-item"  @keyup.enter.native="crud.toQuery"  />
        <label class="el-form-item-label">用户名称</label>
        <el-input v-model="query.userName" clearable size="small" placeholder="用户名称" style="width: 185px;" class="filter-item"  @keyup.enter.native="crud.toQuery"  />
        <label class="el-form-item-label">车辆类型</label>
        <el-input v-model="query.vehicleType" clearable size="small" placeholder="车辆类型" style="width: 185px;" class="filter-item"  @keyup.enter.native="crud.toQuery"  />
        <label class="el-form-item-label">车牌号码</label>
        <el-input v-model="query.licensePlate" clearable size="small" placeholder="车牌号码" style="width: 185px;" class="filter-item"  @keyup.enter.native="crud.toQuery"  />
        <br>
        <label class="el-form-item-label">车辆概述</label>
        <el-input v-model="query.descr" clearable placeholder="车辆概述" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">支付方式</label>
        <el-select v-model="query.buyType" placeholder="支付方式" clearable size="small" class="filter-item" style="width: 110px"  @keyup.enter.native="crud.toQuery" >
          <el-option
            v-for="item in dict.buy_vehicle_channel_type"
            :key="item.id"
            :label="item.label"
            :value="item.value" />
        </el-select>
        <label class="el-form-item-label">车辆状态</label>
        <el-select v-model="query.state" placeholder="车辆状态" clearable size="small" class="filter-item" style="width: 110px"  @keyup.enter.native="crud.toQuery" >
          <el-option
            v-for="item in dict.vehicle_state"
            :key="item.id"
            :label="item.label"
            :value="item.value" />
        </el-select>
        <date-range-picker
          v-model="query.buyTime"
          start-placeholder="购买启始时间"
          end-placeholder="购买结束时间"
          class="date-item"
        />

        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" :hidden-columns="['userId', 'imgPath','department']" />
      <!--表单组件-->
      <el-dialog
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :before-close="crud.cancelCU"
        :visible.sync="crud.status.cu > 0"
        :title="'车辆录入'"
        width="500px"
      >
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="来源">
            <el-input v-model="form.source" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="购入价格" prop="price">
            <el-input v-model.number="form.price" :rows="3" type="textarea" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="采购人">
            <el-autocomplete
              v-model="form.user.name"
              :fetch-suggestions="getUserData"
              placeholder="请输入需要搜索的用户名称"
              :trigger-on-focus="true"
              style="width: 370px;"
              @select="handleSelectUserId"
            >
              <template v-slot="{ item }">
                <div class="name">{{ item.nickName }}</div>
              </template>
            </el-autocomplete>
          </el-form-item>
          <el-form-item :hidden="true" prop="userId" label="用户ID">
            <el-input v-model="form.user.id" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="车辆类型">
            <el-input v-model="form.vehicleType" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="车牌号码">
            <el-input v-model="form.licensePlate" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="入库时间">
            <el-date-picker v-model="form.buyTime" type="datetime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="支付方式">
            <el-select v-model="form.buyType" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.buy_vehicle_channel_type"
                :key="item.id"
                :label="item.label"
                :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="车辆状态">
            <el-select v-model="form.state" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.vehicle_state"
                :key="item.id"
                :label="item.label"
                :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="车辆概述">
            <el-input v-model="form.descr" :rows="3" type="textarea" style="width: 370px;" />
          </el-form-item>
          <el-form-item :hidden="true" label="文件上传">
            <el-input v-model="form.imgPath" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="图片信息">
            <div>
              <template>
                <el-upload
                  ref="upload"
                  class="upload-demo"
                  :action="uploadUrl(fileUploadApi)"
                  :on-preview="handlePreview"
                  :on-remove="handleRemove"
                  :before-upload="beforeUpload"
                  :headers="carHeader"
                  :on-success="handleSuccess"
                  :on-error="handleError"
                  :multiple="true"
                  :limit="50"
                  :file-list="form.imgFileList">
                  <el-button size="small" type="primary">点击上传</el-button>
                  <div slot="tip" class="el-upload__tip">支持格式:jpg/jpeg/png/gif/bmp/svg/webp，且不超过50mb</div>
                </el-upload>
                <el-dialog :close-on-press-escape="false" :close-on-click-modal="false" :visible.sync="dialogVisible" :modal="false">
                  <img width="100%" :src="dialogImageUrl" alt="">
                </el-dialog>
              </template>
            </div>
          </el-form-item>

        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="cancelForm()">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="sumitForm()">确认</el-button>
        </div>
      </el-dialog>

      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-form label-position="left" label-width="auto" inline class="table-expand">
              <el-form-item label="商品描述">
                <span>{{ scope.row.descr }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" />
        <el-table-column prop="source" label="来源" />
        <el-table-column prop="price" label="价格" />
        <el-table-column prop="userName" label="采购人" />
        <el-table-column :hidden="true" prop="userId" label="用户id" />
        <el-table-column prop="department" label="部门" />
        <el-table-column prop="vehicleType" label="车辆类型" />
        <el-table-column prop="licensePlate" label="车牌号码" />
        <el-table-column prop="buyTime" label="入库时间" />
        <el-table-column prop="buyType" label="支付方式">
          <template v-slot="scope">
            {{ dict.label.buy_vehicle_channel_type[scope.row.buyType] }}
          </template>
        </el-table-column>
        <el-table-column prop="state" label="车辆状态">
          <template v-slot="scope">
            {{ dict.label.vehicle_state[scope.row.state] }}
          </template>
        </el-table-column>
        <el-table-column prop="imgPath" label="图片ids"/>
        <el-table-column prop="preview" label="预览图">
          <template v-slot="scope">
            <el-image
              :src="url(scope.row.localStorages, baseApi)"
              :preview-src-list="previewSrcList(scope.row.localStorages, baseApi)"
              fit="cover"
              style="width: 90px; height: 90px"
              :zoom-rate="1.2"
              :max-scale="7"
              :min-scale="0.2"
              class="el-avatar"
            >
            <div slot="error">
              <i class="el-icon-document" />
            </div>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column v-if="checkPer(['admin','vehicleBuyRecord:edit','vehicleBuyRecord:del'])" label="操作" width="150px" align="center">
          <template v-slot="scope">
            <udOperation
              :data="passValue(scope.row, baseApi)"
              :permission="permission"
            />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudVehicleBuyRecord from '@/api/system/vehicleBuyRecord'
import DateRangePicker from '@/components/DateRangePicker'
import CRUD, { crud, form, header, presenter } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import userService from '@/api/system/user.js'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import { removeValueFromString } from '@/utils/upload'

const defaultForm = {
  source: null,
  price: null,
  state: null,
  user: { id: null },
  vehicleType: null,
  licensePlate: null,
  buyTime: null,
  buyType: null
}

export default {
  name: 'VehicleBuyRecord',
  components: { pagination, crudOperation, rrOperation, udOperation, DateRangePicker },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  computed: {
    ...mapGetters([
      'baseApi',
      'fileUploadApi'
    ])
  },
  dicts: ['buy_vehicle_channel_type', 'vehicle_state'],
  cruds() {
    return CRUD({ title: 'vehicleBuyRecordService', url: 'api/vehicleBuyRecord', idField: 'id', sort: 'id,desc', crudMethod: { ...crudVehicleBuyRecord }})
  },
  setup() {
    const getUserData = async(userName, cb) => {
      const response = await userService.getByUserName(userName)
      // console.log(response.content)
      cb(response.content)
    }

    const url = (localStorages, baseApi) => {
      if (!localStorages || localStorages.length === 0) {
        return ''
      }
      return `${baseApi}/file/${localStorages[0].type}/${localStorages[0].realName}`
    }

    const previewSrcList = (localStorages, baseApi) => {
      // console.log(localStorages)
      if (!localStorages) {
        return []
      }
      // 请求接口获取信息并组装成http link字符串
      const res = localStorages.map((ls) => {
        // console.log(ls)
        return `${baseApi}/file/${ls.type}/${ls.realName}`
      })
      // console.log(res)
      return res
    }

    const passValue = (row, baseApi) => {
      if (!row['user']) {
        row['user'] = {}
      }
      row['user']['name'] = row.userName
      // console.log(row.userId)
      row['user']['id'] = row.userId
      if (!row.localStorages) {
        row.imgFileList = []
      } else {
        // imgFileList放的是对象，由上面标签生成的
        row.imgFileList = row.localStorages.map((ls) => {
          return {
            name: `${ls.name}` + '.' + `${ls.suffix}`,
            url: `${baseApi}/file/${ls.type}/${ls.realName}`,
            id: `${ls.id}`,
            type: `${ls.type}`,
            realName: `${ls.realName}`
          }
        })
      }
      return row
    }

    return { getUserData, previewSrcList, url, passValue }
  },

  data() {
    return {
      headers: { 'Authorization': getToken() },
      carHeader: { 'Authorization': getToken(), 'businessType': '1' },
      dialogImageUrl: '',
      dialogVisible: false,
      permission: {
        add: ['admin', 'vehicleBuyRecord:add'],
        edit: ['admin', 'vehicleBuyRecord:edit'],
        del: ['admin', 'vehicleBuyRecord:del']
      },
      loading: false,
      uploadFilename: '',
      rules: {
        price: [
          { required: true, message: '价格不能为空' },
          { type: 'number', message: '价格必须为数字值' }
        ]
      },
      queryTypeOptions: [
        { key: 'source', display_name: '来源' },
        { key: 'userId', display_name: '用户id' },
        { key: 'vehicleType', display_name: '车辆类型' },
        { key: 'licensePlate', display_name: '车牌号码' },
        { key: 'buyType', display_name: '支付方式' },
        { key: 'descr', display_name: '车辆概述' }
      ]
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    handleSelectUserId(item) {
      // console.log('Clicked Item:', item)
      this.form.user.id = item.id + ''
      this.form.user.name = item.nickName + ''
      // this.form.userName = item.nickName
    },
    upload() {
      this.$refs.upload.submit()
    },
    beforeUpload(file) {
      let isLt2M = true
      // 将文件名转换为小写以确保匹配不区分大小写
      const lowerCaseFileName = file.name.toLowerCase()
      // 定义支持的图片文件后缀
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', 'webp']
      // 检查文件名是否以支持的图片文件后缀之一结尾
      isLt2M = imageExtensions.some(extension => lowerCaseFileName.endsWith(extension))
      if (!isLt2M) {
        this.loading = false
        this.$message.error('上传文件只能是图片')
        return isLt2M
      }

      isLt2M = file.size / 1024 / 1024 < 50
      if (!isLt2M) {
        this.loading = false
        this.$message.error('上传文件大小不能超过 50MB!')
        return isLt2M
      }
      // console.log('upload name: ' + file.name)
      this.uploadFilename = file.name
      this.businessType = '1'
      return isLt2M
    },
    handleSuccess(response, file, imgFileList) {
      // console.log(this.crud.form.imgPath)
      if (!this.crud.form.imgPath) {
        this.crud.form.imgPath = ''
      }
      // console.log(this.crud.form.imgPath)
      this.crud.form.imgPath += this.crud.form.imgPath ? ',' + response.id : response.id + ''
      // console.log(this.crud.form.imgPath)
      this.crud.notify('上传成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
    },
    // 监听上传失败
    handleError(e, file, imgFileList) {
      const msg = JSON.parse(e.message)
      this.$notify({
        title: msg.message,
        type: 'error',
        duration: 2500
      })
      this.loading = false
    },
    handleRemove(file, imgFileList) {
      console.log(file, imgFileList)
      this.crud.form.imgPath = removeValueFromString(this.crud.form.imgPath, file.id)
    },
    handlePreview(file) {
      console.log(file)
      this.dialogImageUrl = `${this.baseApi}/file/${file.type}/${file.realName}`
      this.dialogVisible = true
    },
    uploadUrl(fileUploadApi) {
      return fileUploadApi
    },
    cancelForm() {
      this.crud.cancelCU()
      this.crud.form.imgFileList = []
      this.crud.form.imgPath = ''
    },
    sumitForm() {
      this.crud.submitCU()
      this.crud.form.imgPath = ''
      this.crud.form.imgFileList = []
    }
  }
}

</script>

<style scoped>
.table-expand {
  font-size: 0;
}
.table-expand label {
  width: 90px;
  color: #99a9bf;
}
.table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 100%;
}
</style>
