<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">来源</label>
        <el-input v-model="query.source" clearable size="small" placeholder="来源" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">用户名称</label>
        <el-input v-model="query.userName" clearable size="small" placeholder="用户名称" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">车辆类型</label>
        <el-input v-model="query.vehicleType" clearable size="small" placeholder="车辆类型" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">车牌号码</label>
        <el-input v-model="query.licensePlate" clearable size="small" placeholder="车牌号码" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">垫付方式</label>
        <el-select v-model="query.buyType" placeholder="垫付方式" clearable size="small" class="filter-item" style="width: 110px" @change="toQuery">
          <el-option
            v-for="item in dict.buy_vehicle_channel_type"
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
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="来源">
            <el-input v-model="form.source" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="价格">
            <el-input v-model="form.price" :rows="3" type="textarea" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="用户ID">
            <el-autocomplete
              v-model="form.user.id"
              :fetch-suggestions="getUserData"
              placeholder="请输入需要搜索的用户名称"
              style="width: 370px;"
              @select="handleSelect"
            >
            <template v-slot="{ item }">
              <div class="name">{{ item.nickName }}</div>
            </template>
            </el-autocomplete>
          </el-form-item>
          <el-form-item label="车辆类型">
            <el-input v-model="form.vehicleType" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="车牌号码">
            <el-input v-model="form.licensePlate" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="购买时间">
            <el-date-picker v-model="form.buyTime" type="datetime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="垫付方式">
            <el-select v-model="form.buyType" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.buy_vehicle_channel_type"
                :key="item.id"
                :label="item.label"
                :value="item.value" />
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" />
        <el-table-column prop="source" label="来源" />
        <el-table-column prop="price" label="价格" />
        <el-table-column prop="userName" label="用户名称" />
        <el-table-column prop="department" label="部门" />
        <el-table-column prop="vehicleType" label="车辆类型" />
        <el-table-column prop="licensePlate" label="车牌号码" />
        <el-table-column prop="buyTime" label="购买时间" />
        <el-table-column prop="buyType" label="垫付方式">
          <template v-slot="scope">
            {{ dict.label.buy_vehicle_channel_type[scope.row.buyType] }}
          </template>
        </el-table-column>
        <el-table-column v-if="checkPer(['admin','vehicleBuyRecord:edit','vehicleBuyRecord:del'])" label="操作" width="150px" align="center">
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
import crudVehicleBuyRecord from '@/api/system/vehicleBuyRecord'
import DateRangePicker from '@/components/DateRangePicker'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import userService from '@/api/system/user.js'

const defaultForm = { source: null, price: null, user: { id: null }, vehicleType: null, licensePlate: null, buyTime: null, buyType: null }

export default {
  name: 'VehicleBuyRecord',
  components: { pagination, crudOperation, rrOperation, udOperation, DateRangePicker },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['buy_vehicle_channel_type'],
  cruds() {
    return CRUD({ title: 'vehicleBuyRecordService', url: 'api/vehicleBuyRecord', idField: 'id', sort: 'id,desc', crudMethod: { ...crudVehicleBuyRecord }})
  },
  setup() {
    const getUserData = async(userName, cb) => {
      const response = await userService.getByUserName(userName)
      console.log(response.content)
      cb(response.content)
    }

    return { getUserData }
  },
  data() {
    return {
      permission: {
        add: ['admin', 'vehicleBuyRecord:add'],
        edit: ['admin', 'vehicleBuyRecord:edit'],
        del: ['admin', 'vehicleBuyRecord:del']
      },
      rules: {
      },
      queryTypeOptions: [
        { key: 'source', display_name: '来源' },
        { key: 'userId', display_name: '用户id' },
        { key: 'vehicleType', display_name: '车辆类型' },
        { key: 'licensePlate', display_name: '车牌号码' },
        { key: 'buyType', display_name: '垫付方式' }
      ]
    }
  },
  methods: {
    handleSelect(item) {
      console.log('Clicked Item:', item)
      this.form.user.id = item.id
      // this.form.userName = item.nickName
    }
  }
}

</script>

<style scoped>

</style>
