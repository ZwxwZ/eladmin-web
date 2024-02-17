<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <date-range-picker
          v-model="query.createTime"
          start-placeholder="创建时间开始"
          end-placeholder="创建时间结束"
          class="date-item"
        />
        <date-range-picker
          v-model="query.updateTime"
          start-placeholder="更新时间开始"
          end-placeholder="更新时间结束"
          class="date-item"
        />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" :hidden-columns="['filePath']" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="关联车辆">
            <el-autocomplete
              v-model="form.vehicle"
              :fetch-suggestions="getCarData"
              :trigger-on-focus="false"
              placeholder="请输入需要搜索的库存车辆名称"
              style="width: 370px;"
              @select="handleSelect"
            >
              <template v-slot="{ item }">
                <div class="name">
                  <span>{{ item.vehicleType }}</span>
                  <el-image
                    style="width: 100px; height: 50px"
                    :src="url(item.localStorages, baseApi)">
                  </el-image>
                </div>
              </template>
            </el-autocomplete>
          </el-form-item>
          <el-form-item label="库存车辆ID" :readonly="true" prop="vehicleId">
            <el-input v-model="form.vehicleId" :placeholder="'为关联车辆的ID,无值则代表没选中关联车辆'" :disabled = "true" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="商业保险">
            <el-input v-model="form.businessInsurance" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="洗车费">
            <el-input v-model="form.washFee" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="上牌费">
            <el-input v-model="form.plateFee" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="查档费">
            <el-input v-model="form.checkFee" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="网络平台(汽车之家)">
            <el-input v-model="form.platformFee" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="车辆整备费">
            <el-input v-model="form.readyFee" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="贷款返点">
            <el-input v-model="form.loanProfit" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="中介费">
            <el-input v-model="form.brokerageFee" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="杂费">
            <el-input v-model="form.otherFee" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="资料ids" :hidden="true">
            <el-input v-model="form.filePath" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="维修资料">
            <div>
              <template>
                <el-upload
                  ref="upload"
                  class="upload-demo"
                  :action="uploadToUrl(fileUploadApi)"
                  :on-preview="handlePreview"
                  :on-remove="handleRemove"
                  :before-upload="beforeUpload"
                  :headers="maintenanceHeader"
                  :on-success="handleSuccess"
                  :on-error="handleError"
                  :multiple="true"
                  :limit="50"
                  :file-list="form.imgFileList">
                  <el-button size="small" type="primary">点击上传</el-button>
                  <div slot="tip" class="el-upload__tip">支持格式:全部，不超过100mb</div>
                </el-upload>
                <el-dialog :close-on-press-escape="false" :close-on-click-modal="false" :visible.sync="dialogVisible" :modal="false">
                  <img width="100%" :src="dialogImageUrl" alt="">
                </el-dialog>
              </template>
            </div>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-form label-position="left" label-width="auto"  inline class="table-expand">
              <el-form-item label="来源">
                <span>{{ vehicleRecordValue(scope.row, 'source') }}</span>
              </el-form-item>
              <el-form-item label="购入价格">
                <span>{{ vehicleRecordValue(scope.row, 'price') }}</span>
              </el-form-item>
              <el-form-item label="收购人">
                <span>{{ vehicleRecordValue(scope.row, 'userName') }}</span>
              </el-form-item>
              <el-form-item label="车辆类型">
                <span>{{ vehicleRecordValue(scope.row, 'vehicleType') }}</span>
              </el-form-item>
              <el-form-item label="车牌号">
                <span>{{ vehicleRecordValue(scope.row, 'licensePlate') }}</span>
              </el-form-item>
              <el-form-item label="维修资料">
                <div v-for="(ls, index) in scope.row['files']" :key = "index">
                  <a
                    class="el-icon-document"
                    :href="storageUrl(ls, baseApi)"
                    target="_blank"
                    rel="noopener noreferrer"
                    :download="ls.name"
                  >{{ ls.name }}</a>
                </div>
              </el-form-item>
              <el-form-item label="购买时间">
                <span>{{ vehicleRecordValue(scope.row, 'buyTime') }}</span>
              </el-form-item>
              <el-form-item label="库存车图片">
                <span>
                  <el-image
                    v-for="(ls, index) in vehicleRecordValue(scope.row, 'localStorages')"
                    :key = "index"
                    style="width: 100px; height: 100px"
                    :src="storageUrl(ls, baseApi)"
                    :preview-src-list="[storageUrl(ls, baseApi)]"
                  >
                  </el-image>
                </span>
              </el-form-item>
              <el-form-item label="车辆描述">
                <span>{{ vehicleRecordValue(scope.row, 'descr') }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="vehicleBuyRecordDto.vehicleType" label="车辆类型" />
        <el-table-column prop="businessInsurance" label="商业保险" />
        <el-table-column prop="washFee" label="洗车" />
        <el-table-column prop="plateFee" label="上牌费" />
        <el-table-column prop="checkFee" label="查档费" />
        <el-table-column prop="platformFee" label="网络平台(汽车之家)" />
        <el-table-column prop="readyFee" label="车辆整备费" />
        <el-table-column prop="loanProfit" label="贷款返点" />
        <el-table-column prop="brokerageFee" label="中介费" />
        <el-table-column prop="otherFee" label="杂费" />
        <el-table-column prop="filePath" label="资料(维修记录，费用清单)" />
        <el-table-column prop="createBy" label="创建者" />
        <el-table-column prop="updateBy" label="更新者" />
        <el-table-column prop="createTime" label="创建日期" />
        <el-table-column prop="updateTime" label="更新时间" />
        <el-table-column v-if="checkPer(['admin','vehicleMaintenanceCosts:edit','vehicleMaintenanceCosts:del'])" label="操作" width="150px" align="center">
          <template slot-scope="scope">
            <udOperation
              :data="dataEcho(scope.row, baseApi)"
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
import crudVehicleMaintenanceCosts from '@/api/system/vehicleMaintenanceCosts'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import DateRangePicker from '@/components/DateRangePicker'
import { mapGetters } from 'vuex'
import { uploadUrl, localStorageUrl, removeValueFromString } from '@/utils/upload'
import { getToken } from '@/utils/auth'
import vehicleBuyService from '@/api/system/vehicleBuyRecord'
import userService from '@/api/system/user'

const defaultForm = {
  id: null,
  vehicleId: null,
  businessInsurance: null,
  washFee: null,
  plateFee: null,
  checkFee: null,
  platformFee: null,
  readyFee: null,
  loanProfit: null,
  brokerageFee: null,
  otherFee: null,
  filePath: null,
  createBy: null,
  updateBy: null,
  createTime: null,
  updateTime: null
}
export default {
  name: 'VehicleMaintenanceCosts',
  components: { pagination, crudOperation, rrOperation, udOperation, DateRangePicker },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: 'vehicleMaintenanceService', url: 'api/vehicleMaintenanceCosts', idField: 'id', sort: 'id,desc', crudMethod: { ...crudVehicleMaintenanceCosts }})
  },
  setup() {
    const getCarData = async(carName, cb) => {
      if (!carName) {
        cb([{ vehicleType: '无结果' }])
        return
      }
      const response = await vehicleBuyService.searchCarName(carName)
      // console.log(response.content)
      if (response.content.length === 0) {
        cb([{ vehicleType: '无结果' }])
      } else {
        cb(response.content)
      }
    }

    const url = (localStorages, baseApi) => {
      if (!localStorages || localStorages.length === 0) {
        return ''
      }
      return `${baseApi}/file/${localStorages[0].type}/${localStorages[0].realName}`
    }

    const dataEcho = (row, baseApi) => {
      // user echo
      if (!row['seller']) {
        row['seller'] = {}
      }
      row['seller']['name'] = row.seller.nickName
      // fileList echo
      if (!row.files) {
        row.imgFileList = []
      } else {
        // imgFileList放的是对象，由上面标签生成的
        row.imgFileList = row.files.map((ls) => {
          return {
            name: `${ls.name}` + '.' + `${ls.suffix}`,
            url: `${baseApi}/file/${ls.type}/${ls.realName}`,
            id: `${ls.id}`,
            type: `${ls.type}`,
            realName: `${ls.realName}`
          }
        })
      }
      // car name echo
      if (!row.vehicleId) {
        row.vehicle = ''
      } else {
        const dto = row.vehicleBuyRecordDto
        if (dto != null) {
          row.vehicle = dto.vehicleType
        }
      }
      return row
    }

    const getUserData = async(userName, cb) => {
      const response = await userService.getByUserName(userName)
      // console.log(response.content)
      cb(response.content)
    }

    return { getCarData, url, dataEcho, getUserData }
  },
  data() {
    return {
      permission: {
        add: ['admin', 'vehicleMaintenanceCosts:add'],
        edit: ['admin', 'vehicleMaintenanceCosts:edit'],
        del: ['admin', 'vehicleMaintenanceCosts:del']
      },
      dialogImageUrl: '',
      dialogVisible: false,
      loading: false,
      uploadFilename: '',
      maintenanceHeader: { 'Authorization': getToken(), 'businessType': '4' },
      rules: {
        vehicleId: [
          { required: true, message: '没有仓库关联的车辆' }
        ]
      },
      queryTypeOptions: [
      ]
    }
  },
  computed: {
    ...mapGetters([
      'baseApi',
      'fileUploadApi'
    ])
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    vehicleRecordValue(row, field) {
      const dto = row.vehicleBuyRecordDto
      if (!dto) {
        return '空'
      }
      return dto[field]
    },
    uploadToUrl(uploadApi) {
      return uploadUrl(uploadApi, '')
    },
    storageUrl(ls, baseApi) {
      return localStorageUrl(ls, baseApi)
    },
    handleSelect(item) {
      this.form.vehicleId = item.id + ''
      this.form.vehicle = item.vehicleType + ''
    },
    upload() {
      this.$refs.upload.submit()
    },
    beforeUpload(file) {
      let isLt2M = true

      isLt2M = file.size / 1024 / 1024 < 100
      if (!isLt2M) {
        this.loading = false
        this.$message.error('上传文件大小不能超过 100MB!')
        return isLt2M
      }
      this.uploadFilename = file.name
      return isLt2M
    },
    handleSuccess(response, file, imgFileList) {
      // console.log(this.crud.form.filePath)
      if (!this.crud.form.filePath) {
        this.crud.form.filePath = ''
      }
      // console.log(response)
      this.crud.form.filePath += this.crud.form.filePath ? ',' + response.id : response.id + ''
      // console.log(this.crud.form.filePath)
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
      console.log(file)
      this.crud.form.filePath = removeValueFromString(this.crud.form.filePath, file.id)
    },
    handlePreview(file) {
      console.log(file)
      // 将文件名转换为小写以确保匹配不区分大小写
      const lowerCaseFileName = file.name.toLowerCase()
      // 定义支持的图片文件后缀
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', 'webp']
      // 检查文件名是否以支持的图片文件后缀之一结尾
      const isImg = imageExtensions.some(extension => lowerCaseFileName.endsWith(extension))
      if (!isImg) {
        this.loading = false
        this.$message.error(lowerCaseFileName + '格式文件无法打开')
      } else {
        this.dialogImageUrl = this.storageUrl(file, this.baseApi)
        this.dialogVisible = true
      }
    },
    cancelForm() {
      this.crud.cancelCU()
      this.crud.form.imgFileList = []
      this.crud.form.filePath = ''
    },
    sumitForm() {
      this.crud.submitCU()
      this.crud.form.imgFileList = []
      this.crud.form.filePath = ''
    },
    handleSelectUserId(item) {
      // console.log('Clicked Item:', item)
      this.form.seller.id = item.id + ''
      this.form.seller.name = item.nickName + ''
    }
  }
}
</script>

<style scoped>
.table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 100%;
}
</style>
