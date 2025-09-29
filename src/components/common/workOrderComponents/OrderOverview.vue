<template>
  <Card class="bg-white/90 backdrop-blur-sm border-blue-200">
    <CardHeader class="pb-3">
      <CardTitle class="flex items-center space-x-2">
        <FileText class="h-5 w-5 text-blue-600" />
        <span>工单概览</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div v-loading="loading" class="grid grid-cols-4 gap-4">
        <!-- 待处理工单 -->
        <div class="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div class="flex items-center justify-between mb-2">
            <div class="text-orange-600 text-sm font-medium">待处理</div>
            <Clock class="h-4 w-4 text-orange-600" />
          </div>
          <div class="text-2xl font-bold text-orange-700">
            {{ stats.pending }}
          </div>
          <div class="text-orange-600 text-xs mt-1">等待处理</div>
        </div>

        <!-- 进行中工单 -->
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div class="flex items-center justify-between mb-2">
            <div class="text-blue-600 text-sm font-medium">进行中</div>
            <Activity class="h-4 w-4 text-blue-600" />
          </div>
          <div class="text-2xl font-bold text-blue-700">
            {{ stats.in_progress }}
          </div>
          <div class="text-blue-600 text-xs mt-1">正在处理</div>
        </div>

        <!-- 已完成工单 -->
        <div class="bg-green-50 rounded-lg p-4 border border-green-200">
          <div class="flex items-center justify-between mb-2">
            <div class="text-green-600 text-sm font-medium">已完成</div>
            <CheckCircle class="h-4 w-4 text-green-600" />
          </div>
          <div class="text-2xl font-bold text-green-700">
            {{ stats.completed }}
          </div>
          <div class="text-green-600 text-xs mt-1">处理完成</div>
        </div>

        <!-- 总工单数 -->
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div class="flex items-center justify-between mb-2">
            <div class="text-gray-600 text-sm font-medium">总工单</div>
            <FileText class="h-4 w-4 text-gray-600" />
          </div>
          <div class="text-2xl font-bold text-gray-700">
            {{ stats.total }}
          </div>
          <div class="text-gray-600 text-xs mt-1">工单总数</div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import {
  FileText,
  Clock,
  Activity,
  CheckCircle,
} from "lucide-vue-next"
import { api } from '@/utils/api'
import type { WorkOrderStats, OrderStatusStatsResponse } from './types'

// 响应式数据
const stats = ref<WorkOrderStats>({
  pending: 0,
  in_progress: 0,
  completed: 0,
  total: 0
})
const loading = ref(false)

// 获取工单状态统计
const fetchOrderStats = async () => {
  try {
    loading.value = true
    const response = await api.get<OrderStatusStatsResponse>('/get_order_status_stats')

    // 转换API响应为组件需要的格式
    stats.value = {
      pending: response.data.pending_count,
      in_progress: response.data.in_progress_count,
      completed: response.data.completed_count,
      total: response.data.total
    }
  } catch (error) {
    console.error('获取工单统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 暴露刷新方法给父组件
const refresh = () => {
  fetchOrderStats()
}

defineExpose({
  refresh
})

// 生命周期
onMounted(() => {
  fetchOrderStats()
})
</script>