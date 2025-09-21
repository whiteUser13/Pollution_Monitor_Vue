<template>
  <el-dialog v-model="visible" title="工单详情" width="600px" :close-on-click-modal="false">
    <el-form v-if="workOrder" ref="formRef" :model="editForm" :rules="formRules" label-width="100px"
      label-position="left" :class="{ 'readonly-form': !isEditing }">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="工单ID">
            <el-input :value="workOrder.id" readonly class="readonly-input" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-if="isEditing" v-model="editForm.status" placeholder="请选择状态" class="w-full">
              <el-option label="待处理" value="待处理" />
              <el-option label="处理中" value="处理中" />
              <el-option label="已处理" value="已处理" />
              <el-option label="已完成" value="已完成" />
            </el-select>
            <el-input v-else :value="workOrder.status" readonly class="readonly-input" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="监测点" prop="monitoring_point_name">
            <el-select v-if="isEditing" v-model="editForm.point_id" placeholder="请选择监测点" class="w-full">
              <el-option v-for="point in monitoringPoints" :key="point.id" :label="`${point.name} - ${point.location}`"
                :value="point.id" />
            </el-select>
            <el-input v-else :value="workOrder.monitoring_point_name" readonly class="readonly-input" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="位置">
            <el-input :value="workOrder.monitoring_point_location" readonly class="readonly-input" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="污染类型" prop="type">
            <el-select v-if="isEditing" v-model="editForm.type" placeholder="请选择污染类型" class="w-full">
              <el-option label="水质污染" value="水质污染" />
              <el-option label="大气污染" value="大气污染" />
              <el-option label="土壤污染" value="土壤污染" />
              <el-option label="噪声污染" value="噪声污染" />
            </el-select>
            <el-input v-else :value="workOrder.type" readonly class="readonly-input" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="污染物" prop="pollutant">
            <el-input v-if="isEditing" v-model="editForm.pollutant" placeholder="请输入污染物名称" />
            <el-input v-else :value="workOrder.pollutant || '-'" readonly class="readonly-input" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="污染等级" prop="level">
            <el-select v-if="isEditing" v-model="editForm.level" placeholder="请选择污染等级" class="w-full">
              <el-option label="轻微" :value="1" />
              <el-option label="中等" :value="2" />
              <el-option label="严重" :value="3" />
            </el-select>
            <el-input v-else :value="getLevelText(workOrder.level)" readonly class="readonly-input" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="天气" prop="weather">
            <el-input v-if="isEditing" v-model="editForm.weather" placeholder="请输入天气情况" />
            <el-input v-else :value="workOrder.weather || '-'" readonly class="readonly-input" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="创建人" prop="created_by">
            <el-input v-if="isEditing" v-model="editForm.created_by" placeholder="请输入创建人姓名" />
            <el-input v-else :value="workOrder.created_by" readonly class="readonly-input" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="处理人" prop="assigned_to">
            <el-input v-if="isEditing" v-model="editForm.assigned_to" placeholder="请输入处理人姓名" />
            <el-input v-else :value="workOrder.assigned_to || '未分配'" readonly class="readonly-input" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="创建时间">
            <el-input :value="formatDateTime(workOrder.created_at)" readonly class="readonly-input" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="完成时间">
            <el-input :value="formatDateTime(workOrder.completed_at) || '-'" readonly class="readonly-input" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="图片路径" prop="image_path">
        <el-input v-if="isEditing" v-model="editForm.image_path" placeholder="请输入污染图片路径" />
        <el-input v-else :value="workOrder.image_path || '-'" readonly class="readonly-input" />
      </el-form-item>

      <el-form-item label="详细描述" prop="description">
        <el-input v-if="isEditing" v-model="editForm.description" type="textarea" :rows="4"
          placeholder="请详细描述污染情况..." />
        <el-input v-else :value="workOrder.description || '暂无描述'" type="textarea" :rows="4" readonly
          class="readonly-textarea" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end space-x-2">
        <el-button @click="visible = false">关闭</el-button>
        <template v-if="!isEditing">
          <el-button type="primary" @click="handleEdit">编辑</el-button>
        </template>
        <template v-else>
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
        </template>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { api } from '@/utils/api'
import type { WorkOrder, MonitoringPoint } from './types'

// Props
interface Props {
  show: boolean
  workOrder: WorkOrder | null
}

const props = defineProps<Props>()

// Events
const emit = defineEmits<{
  'update:show': [value: boolean]
  'success': []
}>()

// 响应式数据
const isEditing = ref(false)
const loading = ref(false)
const formRef = ref()
const monitoringPoints = ref<MonitoringPoint[]>([])

// 编辑表单数据
const editForm = ref<Partial<WorkOrder>>({})

// 计算属性
const visible = computed({
  get: () => props.show,
  set: (value: boolean) => {
    if (!value) {
      isEditing.value = false
      editForm.value = {}
    }
    emit('update:show', value)
  }
})

// 表单验证规则
const formRules = {
  monitoring_point_name: [
    { required: true, message: '请输入监测点名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择污染类型', trigger: 'change' }
  ],
  created_by: [
    { required: true, message: '请输入创建人姓名', trigger: 'blur' }
  ]
}

// 监听workOrder变化，初始化编辑表单
watch(() => props.workOrder, (newWorkOrder) => {
  if (newWorkOrder) {
    editForm.value = { ...newWorkOrder }
  }
}, { immediate: true })

// 获取监测点数据
const fetchMonitoringPoints = async () => {
  try {
    const response = await api.get('/get_monitoring_info')
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

// 辅助函数
const getLevelText = (level: number | null) => {
  if (!level) return '未设置'
  switch (level) {
    case 1: return '轻微'
    case 2: return '中等'
    case 3: return '严重'
    default: return '未知'
  }
}

const formatDateTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateStr || ''
  }
}

// 事件处理
const handleEdit = async () => {
  if (!isEditing.value) {
    isEditing.value = true
    await fetchMonitoringPoints()
  }
}

const handleCancel = () => {
  isEditing.value = false
  if (props.workOrder) {
    editForm.value = { ...props.workOrder }
  }
}

const handleSave = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    // TODO: 调用更新工单API
    console.log('更新工单数据:', editForm.value)

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    isEditing.value = false
    emit('success')

  } catch (error) {
    console.error('更新工单失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.readonly-form :deep(.el-input__wrapper) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  cursor: not-allowed;
}

.readonly-form :deep(.el-input__inner) {
  color: #606266;
  cursor: not-allowed;
}

.readonly-form :deep(.el-textarea__inner) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
  cursor: not-allowed;
}

.readonly-form :deep(.el-form-item__label) {
  color: #606266;
  font-weight: 500;
}
</style>