<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">商品名称</label>
        <el-input v-model="query.productName" clearable placeholder="商品名称" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">付款方式</label>
        <el-input v-model="query.payType" clearable placeholder="付款方式" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">销售类型</label>
        <el-input v-model="query.sellType" clearable placeholder="销售类型" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">过户类型</label>
        <el-input v-model="query.transferType" clearable placeholder="过户类型" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <div>
          <label class="el-form-item-label">成交价格</label>
          <NumberRange
            v-model="query.dealPrice"
            class="filter-item"
            :disabled="false"
            :precision="0"
          />
          <label class="el-form-item-label">成交时间</label>
          <date-range-picker
            v-model="query.dealTime"
            start-placeholder="成交开始时间"
            end-placeholder="成交结束时间"
            class="date-item"
          />
        </div>
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" :hidden-columns="['vehicleId']" />
      <!--表单组件-->
      <el-dialog
         :close-on-click-modal="false"
         :close-on-press-escape="false"
         :before-close="crud.cancelCU"
         :visible.sync="crud.status.cu > 0"
         :title="crud.status.title"
         width="500px"
      >
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="商品名称">
            <el-input v-model="form.productName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="付款方式">
            <el-select v-model="form.payType" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.car_pay_type"
                :key="item.id"
                :label="item.label"
                :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="销售类型">
            <el-select v-model="form.sellType" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.car_sell_type"
                :key="item.id"
                :label="item.label"
                :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="过户类型">
            <el-select v-model="form.transferType" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.can_transfer_type"
                :key="item.id"
                :label="item.label"
                :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="成交价">
            <el-input v-model.number="form.dealPrice" :rows="3" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="成交时间">
            <el-date-picker v-model="form.dealTime" type="datetime" style="width: 370px;" />
          </el-form-item>
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
          <el-form-item label="车辆ID" :readonly="true" prop="vehicleId">
            <el-input v-model="form.vehicleId" :placeholder="'为关联车辆的ID,无值则代表没选中关联车辆'" :disabled = "true" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="文件资料ids" :hidden="true" >
            <el-input v-model="form.filePath" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="销售资料">
            <div>
              <template>
                <el-upload
                  ref="upload"
                  class="upload-demo"
                  :action="uploadUrl(fileUploadApi)"
                  :on-preview="handlePreview"
                  :on-remove="handleRemove"
                  :before-upload="beforeUpload"
                  :headers="headers"
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
              <el-form-item label="车辆类型">
                <span>{{ vehicleRecordValue(scope.row, 'vehicleType') }}</span>
              </el-form-item>
              <el-form-item label="车牌号">
                <span>{{ vehicleRecordValue(scope.row, 'licensePlate') }}</span>
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
              <el-form-item label="商品描述">
                <span>{{ vehicleRecordValue(scope.row, 'descr') }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" />
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="payType" label="付款方式">
          <template slot-scope="scope">
            {{ dict.label.car_pay_type[scope.row.payType] }}
          </template>
        </el-table-column>
        <el-table-column prop="sellType" label="销售类型">
          <template slot-scope="scope">
            {{ dict.label.car_sell_type[scope.row.sellType] }}
          </template>
        </el-table-column>
        <el-table-column prop="transferType" label="过户类型">
          <template slot-scope="scope">
            {{ dict.label.can_transfer_type[scope.row.transferType] }}
          </template>
        </el-table-column>
        <el-table-column prop="dealPrice" label="成交价" />
        <el-table-column prop="dealTime" label="成交时间" />
        <el-table-column prop="vehicleId" label="库存车辆id" />
        <el-table-column v-if="checkPer(['admin','vehicleSellRecord:edit','vehicleSellRecord:del'])" label="操作" width="150px" align="center">
          <template slot-scope="scope">
            <udOperation
              :data="scope.row"
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
import crudVehicleSellRecord from '@/api/system/vehicleSellRecord'
import DateRangePicker from '@/components/DateRangePicker'
import NumberRange from '@/components/NumberRange'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import vehicleBuyService from '@/api/system/vehicleBuyRecord'
import { mapGetters } from 'vuex'
import { removeValueFromString, uploadUrl } from '@/utils/upload'
import { getToken } from '@/utils/auth'

const defaultForm = {
  id: null,
  productName: null,
  payType: null,
  sellType: null,
  transferType: null,
  dealPrice: null,
  dealTime: null,
  vehicleId: null,
  filePath: null,
  vehicle: null
}
export default {
  name: 'VehicleSellRecord',
  components: { pagination, crudOperation, rrOperation, udOperation, DateRangePicker, NumberRange },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['car_pay_type', 'car_sell_type', 'can_transfer_type'],
  cruds() {
    return CRUD({ title: '销售记录', url: 'api/vehicleSellRecord', idField: 'id', sort: 'id,desc', crudMethod: { ...crudVehicleSellRecord }})
  },
  computed: {
    ...mapGetters([
      'baseApi',
      'fileUploadApi'
    ])
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

    const storageUrl = (localStorage, baseApi) => {
      return `${baseApi}/file/${localStorage.type}/${localStorage.realName}`
    }

    return { getCarData, storageUrl, url }
  },
  data() {
    return {
      permission: {
        add: ['admin', 'vehicleSellRecord:add'],
        edit: ['admin', 'vehicleSellRecord:edit'],
        del: ['admin', 'vehicleSellRecord:del']
      },
      dialogImageUrl: '',
      dialogVisible: false,
      loading: false,
      uploadFilename: '',
      headers: { 'Authorization': getToken() },
      rules: {
        dealPrice: [
          { required: true, message: '价格不能为空' },
          { type: 'number', message: '价格必须为数字值' }
        ],
        vehicleId: [
          { required: true, message: '没有仓库关联的车辆' }
        ]
      },
      queryTypeOptions: [
        { key: 'productName', display_name: '商品名称' },
        { key: 'payType', display_name: '付款方式' },
        { key: 'sellType', display_name: '销售类型' },
        { key: 'transferType', display_name: '过户类型' }
      ]
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    handleSelect(item) {
      this.form.vehicleId = item.id + ''
      this.form.vehicle = item.vehicleType + ''
    },
    vehicleRecordValue(row, field) {
      const dto = row.vehicleBuyRecordDto
      if (!dto) {
        return '空'
      }
      return dto[field]
    },
    uploadUrl(uploadApi) {
      return uploadUrl(uploadApi, this.uploadFilename)
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
      // console.log(this.crud.form.filePath)
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
      this.crud.form.filePath = removeValueFromString(this.crud.form.filePath, file.response.id)
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
        this.$message.error('文件无法打开')
      } else {
        this.dialogImageUrl = this.storageUrl(file.response, this.baseApi)
        this.dialogVisible = true
      }
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
