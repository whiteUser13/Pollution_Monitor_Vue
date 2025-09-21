<template>
  <Card class="flex-1 bg-white/90 backdrop-blur-sm border-blue-200">
    <CardHeader class="pb-3">
      <CardTitle class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <FileText class="h-5 w-5 text-blue-600" />
          <span>工单列表</span>
        </div>
        <div class="flex space-x-2">
          <button class="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            @click="handleCreateOrder">
            创建工单
          </button>
        </div>
      </CardTitle>
    </CardHeader>
    <CardContent class="flex-1">
      <div v-loading="loading" class="h-full">
        <div class="overflow-x-auto">
          <el-table :data="workOrders" stripe class="w-full" style="min-width: 900px;" empty-text="暂无工单数据">
            <el-table-column prop="id" label="工单ID" width="70" />
            <el-table-column prop="monitoring_point_name" label="监测点" width="100" />
            <el-table-column prop="monitoring_point_location" label="位置" width="150" />
            <el-table-column prop="type" label="污染类型" width="100" />
            <el-table-column prop="pollutant" label="污染物" width="120" show-overflow-tooltip />
            <el-table-column prop="level" label="等级" width="70">
              <template #default="scope">
                <el-tag :type="getLevelTagType(scope?.row?.level)" size="small" v-if="scope?.row">
                  {{ getLevelText(scope.row.level) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope?.row?.status)" size="small" v-if="scope?.row">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="created_by" label="创建人" width="80" />
            <el-table-column prop="assigned_to" label="处理人" width="80">
              <template #default="scope">
                <span v-if="scope?.row">{{ scope.row.assigned_to || '未分配' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" width="140">
              <template #default="scope">
                <span v-if="scope?.row">{{ formatDateTime(scope.row.created_at) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="weather" label="天气" width="100">
              <template #default="scope">
                <span v-if="scope?.row">{{ scope.row.weather || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
          </el-table>
        </div>

        <!-- 分页器 -->
        <div class="flex justify-end mt-4" v-if="total > 0">
          <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
            :total="total" layout="total, sizes, prev, pager, next, jumper" @current-change="handlePageChange"
            @size-change="handlePageSizeChange" />
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { FileText } from "lucide-vue-next"
import axios from 'axios'
import type { WorkOrder, WorkOrderResponse } from './types'

// Props
interface Props {
  loading?: boolean
}

defineProps<Props>()

// Events
const emit = defineEmits<{
  createOrder: []
  refresh: []
}>()

// 响应式数据
const workOrders = ref<WorkOrder[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// API服务函数
const fetchWorkOrders = async (pageNum: number = 1, pageSize: number = 10) => {
  try {
    loading.value = true
    const response = await axios.get<WorkOrderResponse>('/get_orders_by_page', {
      params: {
        pageNum,
        pageSize
      }
    })

    workOrders.value = response.data.orders
    total.value = response.data.total
    currentPage.value = response.data.pageNum

    return response.data
  } catch (error) {
    console.error('获取工单列表失败:', error)
    throw error
  } finally {
    loading.value = false
  }
}

// 处理分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchWorkOrders(page, pageSize.value)
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchWorkOrders(1, size)
}

// 辅助函数
const getLevelTagType = (level: number | null) => {
  if (!level) return ''
  switch (level) {
    case 1: return 'info'
    case 2: return 'warning'
    case 3: return 'danger'
    default: return ''
  }
}

const getLevelText = (level: number | null) => {
  if (!level) return '未设置'
  switch (level) {
    case 1: return '轻微'
    case 2: return '中等'
    case 3: return '严重'
    default: return '未知'
  }
}

const getStatusTagType = (status: string | undefined) => {
  if (!status) return ''
  switch (status) {
    case '待处理': return 'warning'
    case '处理中': return 'primary'
    case '已处理': return 'success'
    case '已完成': return 'success'
    default: return ''
  }
}

const formatDateTime = (dateStr: string | undefined) => {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateStr
  }
}

// Handlers
const handleCreateOrder = () => {
  emit('createOrder')
}

// 暴露方法给父组件
const refresh = () => {
  fetchWorkOrders(currentPage.value, pageSize.value)
}

defineExpose({
  refresh,
  fetchWorkOrders
})

// 生命周期
onMounted(() => {
  fetchWorkOrders()
})
</script>