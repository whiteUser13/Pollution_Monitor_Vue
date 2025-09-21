<template>
  <el-dialog v-model="visible" title="创建工单" width="600px" :close-on-click-modal="false" @closed="handleDialogClosed">
    <el-form ref="createFormRef" :model="createForm" :rules="formRules" label-width="100px" label-position="left">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="监测点" prop="point_id" required>
            <el-select v-model="createForm.point_id" placeholder="请选择监测点" class="w-full">
              <el-option v-for="point in monitoringPoints" :key="point.id" :label="`${point.name} - ${point.location}`"
                :value="point.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="污染类型" prop="type" required>
            <el-select v-model="createForm.type" placeholder="请选择污染类型" class="w-full">
              <el-option label="水质污染" value="水质污染" />
              <el-option label="大气污染" value="大气污染" />
              <el-option label="土壤污染" value="土壤污染" />
              <el-option label="噪声污染" value="噪声污染" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="创建人" prop="created_by" required>
            <el-input v-model="createForm.created_by" placeholder="请输入创建人姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="处理人" prop="assigned_to">
            <el-input v-model="createForm.assigned_to" placeholder="请输入处理人姓名" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="污染等级" prop="level">
            <el-select v-model="createForm.level" placeholder="请选择污染等级" class="w-full">
              <el-option label="轻微" :value="1" />
              <el-option label="中等" :value="2" />
              <el-option label="严重" :value="3" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="createForm.status" placeholder="请选择状态" class="w-full">
              <el-option label="待处理" value="待处理" />
              <el-option label="处理中" value="处理中" />
              <el-option label="已处理" value="已处理" />
              <el-option label="已完成" value="已完成" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="污染物" prop="pollutant">
            <el-input v-model="createForm.pollutant" placeholder="请输入污染物名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="天气" prop="weather">
            <el-input v-model="createForm.weather" placeholder="请输入天气情况" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="图片路径" prop="image_path">
        <el-input v-model="createForm.image_path" placeholder="请输入污染图片路径" />
      </el-form-item>

      <el-form-item label="详细描述" prop="description">
        <el-input v-model="createForm.description" type="textarea" :rows="4" placeholder="请详细描述污染情况..." />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <el-button @click="handleClose">取消</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          创建工单
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import type { CreateWorkOrderForm, MonitoringPoint } from './types'

// Props
interface Props {
  show: boolean
}

const props = defineProps<Props>()

// Events
const emit = defineEmits<{
  'update:show': [value: boolean]
  close: []
  success: []
}>()

// 响应式数据
const loading = ref(false)
const createFormRef = ref()
const monitoringPoints = ref<MonitoringPoint[]>([])
const createForm = ref<CreateWorkOrderForm>({
  point_id: '',
  type: '',
  created_by: '',
  description: '',
  assigned_to: '',
  status: '待处理',
  image_path: '',
  level: null,
  pollutant: '',
  weather: ''
})

// 计算属性
const visible = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value)
})

// 表单验证规则
const formRules = {
  point_id: [
    { required: true, message: '请选择监测点', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择污染类型', trigger: 'change' }
  ],
  created_by: [
    { required: true, message: '请输入创建人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '创建人姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}

// 获取监测点数据
const fetchMonitoringPoints = async () => {
  try {
    const response = await axios.get('/get_monitoring_info')
    monitoringPoints.value = response.data.map((point: any) => ({
      id: point.id,
      name: point.name,
      location: point.location,
      latitude: point.latitude,
      longitude: point.longitude,
      pollution_type: point.pollution_type,
      status: point.status
    }))
  } catch (error) {
    console.error('获取监测点数据失败:', error)
  }
}

// 重置表单
const resetForm = () => {
  createForm.value = {
    point_id: '',
    type: '',
    created_by: '',
    description: '',
    assigned_to: '',
    status: '待处理',
    image_path: '',
    level: null,
    pollutant: '',
    weather: ''
  }
  createFormRef.value?.clearValidate()
}

// 事件处理
const handleClose = () => {
  visible.value = false
  emit('close')
}

const handleReset = () => {
  resetForm()
}

const handleDialogClosed = () => {
  resetForm()
}

const handleSubmit = async () => {
  try {
    // 表单验证
    await createFormRef.value?.validate()

    // TODO: 实现表单提交逻辑
    console.log('表单数据:', createForm.value)
    console.log('表单验证通过，准备提交...')

    // 这里暂时只是打印表单数据，后续会实现真正的提交
    // loading.value = true
    // 提交成功后关闭对话框并通知父组件
    // visible.value = false
    // emit('success')

  } catch (error) {
    console.log('表单验证失败:', error)
  }
}

// 生命周期
onMounted(() => {
  fetchMonitoringPoints()
})
</script>