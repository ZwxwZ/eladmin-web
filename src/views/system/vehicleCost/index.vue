<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
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
              <el-form-item label="销售人">
                <span>{{ vehicleSellRecordValue(scope.row, 'seller').nickName }}</span>
              </el-form-item>
              <el-form-item label="成交时间">
                <span>{{ vehicleSellRecordValue(scope.row, 'dealTime') }}</span>
              </el-form-item>
              <el-form-item label="购买时间">
                <span>{{ vehicleRecordValue(scope.row, 'buyTime') }}</span>
              </el-form-item>
              <el-form-item label="商业保险">
                <span>{{ vehicleMaintenanceValue(scope.row, 'businessInsurance') }}</span>
              </el-form-item>
              <el-form-item label="洗车">
                <span>{{ vehicleMaintenanceValue(scope.row, 'washFee') }}</span>
              </el-form-item>
              <el-form-item label="上牌费">
                <span>{{ vehicleMaintenanceValue(scope.row, 'plateFee') }}</span>
              </el-form-item>
              <el-form-item label="查档费">
                <span>{{ vehicleMaintenanceValue(scope.row, 'checkFee') }}</span>
              </el-form-item>
              <el-form-item label="网络平台">
                <span>{{ vehicleMaintenanceValue(scope.row, 'platformFee') }}</span>
              </el-form-item>
              <el-form-item label="车辆整备费">
                <span>{{ vehicleMaintenanceValue(scope.row, 'readyFee') }}</span>
              </el-form-item>
              <el-form-item label="贷款返点">
                <span>{{ vehicleMaintenanceValue(scope.row, 'loanProfit') }}</span>
              </el-form-item>
              <el-form-item label="中介费">
                <span>{{ vehicleMaintenanceValue(scope.row, 'brokerageFee') }}</span>
              </el-form-item>
              <el-form-item label="杂费">
                <span>{{ vehicleMaintenanceValue(scope.row, 'otherFee') }}</span>
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
              <el-form-item label="销售资料">
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
              <el-form-item label="商品描述">
                <span>{{ vehicleRecordValue(scope.row, 'descr') }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="vehicleType" label="车辆类型" />
        <el-table-column prop="licensePlate" label="车牌号" />
        <el-table-column prop="price" label="采购价" :formatter="formatValue" />
        <el-table-column prop="vehicleSellRecord.salesCommission" label="销售提成" :formatter="formatValue"/>
        <el-table-column prop="vehicleSellRecord.procurementCommission" label="采购提成" :formatter="formatValue" />
        <el-table-column label="提成总价">
          <template slot-scope="{ row }">
            {{ sellFee(row) }}
          </template>
        </el-table-column>
        <el-table-column label="车行费用">
          <template slot-scope="{ row }">
            {{ calculateCarExpense(row.maintenanceCostsDto) }}
          </template>
        </el-table-column>
        <el-table-column prop="vehicleSellRecord.dealPrice" label="成交价" :formatter="formatValue"/>
        <el-table-column label="利润">
          <template slot-scope="{ row }">
            {{ calculateCarProfit(row) }}
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import pagination from '@crud/Pagination'
import { mapGetters } from 'vuex'
import { localStorageUrl } from '@/utils/upload'

const defaultForm = {
  id: null,
  productName: null,
  seller: { id: null, name: null },
  payType: null,
  sellType: null,
  transferType: null,
  dealPrice: null,
  dealTime: null,
  vehicleId: null,
  filePath: null,
  vehicle: null,
  procurementCommission: null,
  salesCommission: null
}
export default {
  name: 'VehicleSellRecord',
  components: { pagination },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['car_pay_type', 'car_sell_type', 'can_transfer_type'],
  cruds() {
    return CRUD({ title: '成本核算', url: 'api/costAccount', idField: 'id', sort: 'id,desc', crudMethod: { }})
  },
  data() {
    return {
      permission: {
      },
      rules: {
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
    calculateCarExpense(row) {
      return this.defaultZero(row.businessInsurance) +
        this.defaultZero(row.washFee) +
        this.defaultZero(row.plateFee) +
        this.defaultZero(row.checkFee) +
        this.defaultZero(row.platformFee) +
        this.defaultZero(row.readyFee) +
        this.defaultZero(row.loanProfit) +
        this.defaultZero(row.brokerageFee) +
        this.defaultZero(row.otherFee)
    },
    sellFee(row) {
      return this.defaultZero(row.vehicleSellRecord.salesCommission) + this.defaultZero(row.vehicleSellRecord.procurementCommission)
    },
    calculateCarProfit(row) {
      return this.defaultZero(row.vehicleSellRecord.dealPrice) - this.calculateCarExpense(row.maintenanceCostsDto) - this.defaultZero(row.price) - this.sellFee(row)
    },
    vehicleRecordValue(row, field) {
      const dto = row
      if (!dto) {
        return '空'
      }
      return dto[field]
    },
    vehicleMaintenanceValue(row, field) {
      const dto = row.maintenanceCostsDto
      if (!dto) {
        return '空'
      }
      return dto[field] ? dto[field] : 0
    },
    vehicleSellRecordValue(row, field) {
      const dto = row.vehicleSellRecord
      if (!dto) {
        return '空'
      }
      return dto[field] ? dto[field] : 0
    },
    storageUrl(ls, baseApi) {
      return localStorageUrl(ls, baseApi)
    },
    formatValue(row, column, cellValue) {
      // 检查 cellValue 是否为 null，如果是则显示为 0，否则显示原始值
      return cellValue === null ? 0 : cellValue
    },
    defaultZero(cellValue) {
      return cellValue === null ? 0 : cellValue
    }
  }
}
</script>

<style scoped>
.table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 30%;
}
</style>
