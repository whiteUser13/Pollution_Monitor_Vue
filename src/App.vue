<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
    <!-- 顶部标题栏 -->
    <div class="bg-white/80 backdrop-blur-sm shadow-sm border-b">
      <div class="flex items-center justify-between px-6 py-4">
        <div class="flex items-center space-x-3">
          <div
            class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Droplets class="h-5 w-5 text-white" />
          </div>
          <h1 class="text-xl font-bold text-gray-900">
            智能河流污染实时监测系统
          </h1>
          <div class="text-sm text-gray-500">实时监控 智能分析 科学决策</div>
        </div>
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <div class="text-2xl font-bold text-blue-600">
              {{ store.statistics?.alertCount.danger || 0 }}
            </div>
            <div class="text-sm text-gray-600">告警</div>
          </div>
          <div class="flex items-center space-x-2">
            <div class="text-2xl font-bold text-green-600">
              {{ store.statistics?.alertCount.normal || 0 }}
            </div>
            <div class="text-sm text-gray-600">正常</div>
          </div>
          <div class="flex items-center space-x-2">
            <div class="text-2xl font-bold text-orange-600">
              {{ store.statistics?.alertCount.warning || 0 }}
            </div>
            <div class="text-sm text-gray-600">异常</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 三列布局主体 -->
    <div class="flex h-[calc(100vh-80px)]">
      <!-- 左侧导航栏 -->
      <div
        class="w-64 bg-white/80 backdrop-blur-sm shadow-sm border-r flex flex-col">
        <div class="p-4 border-b">
          <h2 class="text-sm font-semibold text-gray-700 flex items-center">
            <Activity class="h-4 w-4 mr-2" />
            功能导航
          </h2>
        </div>
        <div class="flex-1 p-2">
          <div class="space-y-1">
            <button
              :class="[
                'w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                store.activeTab === 'map'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100',
              ]"
              @click="store.setActiveTab('map')">
              <MapPin class="h-4 w-4 mr-2" />
              监测点
            </button>
            <button
              :class="[
                'w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                store.activeTab === 'orders'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100',
              ]"
              @click="store.setActiveTab('orders')">
              <FileText class="h-4 w-4 mr-2" />
              工单管理
            </button>
            <button
              :class="[
                'w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                store.activeTab === 'ai'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100',
              ]"
              @click="store.setActiveTab('ai')">
              <MessageSquare class="h-4 w-4 mr-2" />
              AI分析
            </button>
            <button
              :class="[
                'w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                store.activeTab === 'stats'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100',
              ]"
              @click="store.setActiveTab('stats')">
              <BarChart3 class="h-4 w-4 mr-2" />
              数据统计
            </button>
          </div>
        </div>
      </div>

      <!-- 中间主内容区域 -->
      <div class="flex-1 flex flex-col">
        <template v-if="store.activeTab === 'map'">
          <!-- 地图区域 -->
          <div class="flex-1 p-4">
            <MonitoringMap :monitoring-points="store.monitoringPoints" />
          </div>
        </template>

        <template v-if="store.activeTab === 'orders'">
          <!-- 工单管理区域 -->
          <div class="flex-1 p-4">
            <WorkOrderManagement
              :work-order-stats="store.statistics?.workOrderStats"
              @create-order="handleCreateOrder" />
          </div>
        </template>

        <template v-if="store.activeTab === 'ai'">
          <div class="flex-1 p-4">
            <Card class="h-full bg-white/90 backdrop-blur-sm">
              <AIAssistant />
            </Card>
          </div>
        </template>

        <template v-if="store.activeTab === 'stats'">
          <div class="flex-1">
            <DataStatistics />
          </div>
        </template>
      </div>

      <!-- 右侧信息栏 -->
      <div
        class="w-80 bg-white/80 backdrop-blur-sm shadow-sm border-l flex flex-col">
        <div class="p-4 border-b">
          <h2 class="text-sm font-semibold text-gray-700 flex items-center">
            <Activity class="h-4 w-4 mr-2" />
            系统状态
          </h2>
        </div>

        <div class="flex-1 p-4 space-y-4">
          <!-- 数据更新状态 -->
          <div class="space-y-2">
            <div class="text-sm font-medium text-gray-700">数据更新状态</div>
            <div
              class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span class="text-sm text-gray-600">上次更新成功</span>
              <Badge variant="secondary" class="text-green-600 bg-green-100">
                <CheckCircle class="h-3 w-3 mr-1" />
                正常
              </Badge>
            </div>
          </div>

          <!-- 网络状态 -->
          <div class="space-y-2">
            <div class="text-sm font-medium text-gray-700">网络连接</div>
            <div
              class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span class="text-sm text-gray-600">连接状态</span>
              <Badge variant="secondary" class="text-green-600 bg-green-100">
                <CheckCircle class="h-3 w-3 mr-1" />
                在线
              </Badge>
            </div>
          </div>

          <!-- 系统负载 -->
          <div class="space-y-2">
            <div class="text-sm font-medium text-gray-700">系统负载</div>
            <div
              class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span class="text-sm text-gray-600">当前负载</span>
              <Badge variant="secondary" class="text-blue-600 bg-blue-100">
                <Activity class="h-3 w-3 mr-1" />
                低
              </Badge>
            </div>
          </div>

          <!-- 快速操作 -->
          <div class="space-y-2">
            <div class="text-sm font-medium text-gray-700">快速操作</div>
            <div class="space-y-2">
              <button
                class="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div class="flex items-center space-x-2">
                  <AlertTriangle class="h-4 w-4 text-orange-600" />
                  <span class="text-sm">告警管理</span>
                </div>
              </button>
              <button
                class="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div class="flex items-center space-x-2">
                  <FileText class="h-4 w-4 text-blue-600" />
                  <span class="text-sm">生成报告</span>
                </div>
              </button>
              <button
                class="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div class="flex items-center space-x-2">
                  <Users class="h-4 w-4 text-purple-600" />
                  <span class="text-sm">询问 AI</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div
      v-if="store.loading"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <Card class="p-6">
        <div class="flex items-center space-x-4">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="text-gray-700">加载数据中...</span>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Badge } from "@/components/ui"
import {
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Activity,
  Droplets,
  Thermometer,
  Zap,
  MessageSquare,
  FileText,
  BarChart3,
} from "lucide-vue-next"
import { useMonitoringStore } from "@/stores/monitoring"
import MonitoringMap from "@/components/common/MonitoringMap.vue"
import WorkOrderManagement from "@/components/common/WorkOrderManagement.vue"
import AIAssistant from "@/components/common/AIAssistant.vue"
import DataStatistics from "@/components/common/DataStatistics.vue"

const store = useMonitoringStore()

onMounted(() => {
  store.loadData()
})

const getAlertColor = (level: string) => {
  switch (level) {
    case "danger":
      return "text-red-600 bg-red-100"
    case "warning":
      return "text-orange-600 bg-orange-100"
    case "normal":
      return "text-green-600 bg-green-100"
    default:
      return "text-gray-600 bg-gray-100"
  }
}

const handleCreateOrder = () => {
  // TODO: 实现创建工单逻辑
  console.log("创建工单")
}
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
