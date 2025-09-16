<template>
  <div class="h-full flex flex-col space-y-4">
    <!-- 工单概览 -->
    <Card class="bg-white/90 backdrop-blur-sm border-blue-200">
      <CardHeader class="pb-3">
        <CardTitle class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <FileText class="h-5 w-5 text-blue-600" />
            <span>工单概览</span>
          </div>
          <div class="flex space-x-2">
            <button class="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              @click="handleCreateOrder">
              创建工单
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-4 gap-4">
          <!-- 待处理工单 -->
          <div class="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div class="flex items-center justify-between mb-2">
              <div class="text-orange-600 text-sm font-medium">待处理</div>
              <Clock class="h-4 w-4 text-orange-600" />
            </div>
            <div class="text-2xl font-bold text-orange-700">
              {{ workOrderStats?.pending || 0 }}
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
              {{ workOrderStats?.in_progress || 0 }}
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
              {{ workOrderStats?.completed || 0 }}
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
              {{ workOrderStats?.total || 0 }}
            </div>
            <div class="text-gray-600 text-xs mt-1">工单总数</div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 工单列表 -->
    <Card class="flex-1 bg-white/90 backdrop-blur-sm border-blue-200">
      <CardHeader class="pb-3">
        <CardTitle class="flex items-center space-x-2">
          <FileText class="h-5 w-5 text-blue-600" />
          <span>工单列表</span>
        </CardTitle>
      </CardHeader>
      <CardContent class="flex-1">
        <div class="flex items-center justify-center py-12 text-gray-500 h-full">
          <div class="text-center">
            <FileText class="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p class="text-lg font-medium mb-2">暂无工单</p>
            <p class="text-sm">点击上方"创建工单"按钮来创建第一个工单</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import {
  FileText,
  Clock,
  Activity,
  CheckCircle,
} from "lucide-vue-next"

// Props
interface Props {
  workOrderStats?: {
    pending: number
    in_progress: number
    completed: number
    total: number
  }
}

defineProps<Props>()

// Events
const emit = defineEmits<{
  createOrder: []
}>()

// Handlers
const handleCreateOrder = () => {
  emit('createOrder')
}
</script>
