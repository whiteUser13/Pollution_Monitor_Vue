<template>
  <div class="h-full flex flex-col bg-gray-50">
    <!-- 统计头部 -->
    <div class="p-4 bg-white border-b">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <BarChart3 class="h-5 w-5 text-purple-600" />
          <h3 class="font-semibold text-gray-800">数据统计分析</h3>
          <Badge variant="secondary" class="text-blue-600 bg-blue-100">实时更新</Badge>
        </div>
        <div class="flex items-center space-x-2">
          <button @click="refreshData"
            class="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
            <RefreshCw class="h-3 w-3" />
            <span>刷新</span>
          </button>
          <button @click="exportData"
            class="flex items-center space-x-1 px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
            <Download class="h-3 w-3" />
            <span>导出</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="p-4">
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow-sm border p-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin class="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div class="text-2xl font-bold text-blue-600">{{ stats.totalPoints }}</div>
              <div class="text-sm text-gray-500">监测点</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle class="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div class="text-2xl font-bold text-green-600">{{ stats.normalPoints }}</div>
              <div class="text-sm text-gray-500">正常运行</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle class="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div class="text-2xl font-bold text-orange-600">{{ stats.warningPoints }}</div>
              <div class="text-sm text-gray-500">异常点位</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText class="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div class="text-2xl font-bold text-purple-600">{{ stats.totalOrders }}</div>
              <div class="text-sm text-gray-500">工单总数</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="flex-1 p-4 overflow-auto">
      <div class="grid grid-cols-2 gap-4 h-full">
        <!-- 危险级分析 -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-4 border-b">
            <div class="flex items-center space-x-2">
              <AlertTriangle class="h-4 w-4 text-orange-600" />
              <h4 class="font-medium text-gray-700">危险级分析</h4>
            </div>
          </div>
          <div class="p-4">
            <div ref="riskChart" class="w-full h-64"></div>
          </div>
        </div>

        <!-- 工单状态分布 -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-4 border-b">
            <div class="flex items-center space-x-2">
              <FileText class="h-4 w-4 text-purple-600" />
              <h4 class="font-medium text-gray-700">工单状态分布</h4>
            </div>
          </div>
          <div class="p-4">
            <div ref="orderChart" class="w-full h-64"></div>
          </div>
        </div>

        <!-- 监测点状况 -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-4 border-b">
            <div class="flex items-center space-x-2">
              <PieChart class="h-4 w-4 text-green-600" />
              <h4 class="font-medium text-gray-700">监测点状况</h4>
            </div>
          </div>
          <div class="p-4">
            <div ref="statusChart" class="w-full h-64"></div>
          </div>
        </div>

        <!-- 水质参数趋势 -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-4 border-b">
            <div class="flex items-center space-x-2">
              <TrendingUp class="h-4 w-4 text-blue-600" />
              <h4 class="font-medium text-gray-700">水质参数趋势</h4>
            </div>
          </div>
          <div class="p-4">
            <div ref="trendChart" class="w-full h-64"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { Badge } from '@/components/ui'
import {
  BarChart3,
  MapPin,
  CheckCircle,
  AlertTriangle,
  FileText,
  PieChart,
  TrendingUp,
  RefreshCw,
  Download
} from 'lucide-vue-next'
import * as echarts from 'echarts'

// 图表实例引用
const riskChart = ref<HTMLElement>()
const orderChart = ref<HTMLElement>()
const statusChart = ref<HTMLElement>()
const trendChart = ref<HTMLElement>()

// ECharts实例
let riskChartInstance: echarts.ECharts | null = null
let orderChartInstance: echarts.ECharts | null = null
let statusChartInstance: echarts.ECharts | null = null
let trendChartInstance: echarts.ECharts | null = null

// 统计数据
const stats = reactive({
  totalPoints: 6,
  normalPoints: 5,
  warningPoints: 0,
  totalOrders: 0
})

// 危险级分析数据
const riskData = {
  categories: ['三级', '二级', '一级', '0级'],
  values: [3, 0, 0, 0],
  colors: ['#10B981', '#F59E0B', '#EF4444', '#DC2626']
}

// 工单状态数据  
const orderData = {
  categories: ['待处理', '处理中', '已完成'],
  values: [4, 3, 2, 1],
  colors: ['#3B82F6', '#F59E0B', '#10B981']
}

// 监测点状况数据
const statusData = [
  { name: '正常', value: 5, color: '#10B981' },
  { name: '警告', value: 1, color: '#F59E0B' },
  { name: '危险', value: 0, color: '#EF4444' }
]

// 水质参数趋势数据
const trendData = {
  dates: ['9月11日', '9月13日', '9月16日'],
  ph: [7.2, 7.1, 7.3],
  oxygen: [8.5, 8.2, 8.7],
  turbidity: [2.1, 2.3, 1.9]
}

// 初始化危险级分析图表
const initRiskChart = () => {
  if (!riskChart.value) return

  riskChartInstance = echarts.init(riskChart.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: riskData.categories,
      axisTick: {
        alignWithLabel: true
      },
      axisLabel: {
        color: '#6B7280'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#6B7280'
      },
      splitLine: {
        lineStyle: {
          color: '#E5E7EB'
        }
      }
    },
    series: [{
      name: '监测点数量',
      type: 'bar',
      barWidth: '60%',
      data: riskData.values.map((value, index) => ({
        value,
        itemStyle: {
          color: riskData.colors[index]
        }
      }))
    }]
  }

  riskChartInstance.setOption(option)
}

// 初始化工单状态图表
const initOrderChart = () => {
  if (!orderChart.value) return

  orderChartInstance = echarts.init(orderChart.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: orderData.categories,
      axisTick: {
        alignWithLabel: true
      },
      axisLabel: {
        color: '#6B7280'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#6B7280'
      },
      splitLine: {
        lineStyle: {
          color: '#E5E7EB'
        }
      }
    },
    series: [{
      name: '工单数量',
      type: 'bar',
      barWidth: '60%',
      data: orderData.values.map((value, index) => ({
        value,
        itemStyle: {
          color: orderData.colors[index]
        }
      }))
    }]
  }

  orderChartInstance.setOption(option)
}

// 初始化监测点状况饼图
const initStatusChart = () => {
  if (!statusChart.value) return

  statusChartInstance = echarts.init(statusChart.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        color: '#6B7280'
      }
    },
    series: [{
      name: '监测点状况',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['60%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '18',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: statusData.map(item => ({
        ...item,
        itemStyle: {
          color: item.color
        }
      }))
    }]
  }

  statusChartInstance.setOption(option)
}

// 初始化水质参数趋势图表
const initTrendChart = () => {
  if (!trendChart.value) return

  trendChartInstance = echarts.init(trendChart.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['pH值', '溶解氧', '浊度'],
      textStyle: {
        color: '#6B7280'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendData.dates,
      axisLabel: {
        color: '#6B7280'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#6B7280'
      },
      splitLine: {
        lineStyle: {
          color: '#E5E7EB'
        }
      }
    },
    series: [
      {
        name: 'pH值',
        type: 'line',
        smooth: true,
        data: trendData.ph,
        lineStyle: {
          color: '#3B82F6'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
            ]
          }
        }
      },
      {
        name: '溶解氧',
        type: 'line',
        smooth: true,
        data: trendData.oxygen,
        lineStyle: {
          color: '#10B981'
        }
      },
      {
        name: '浊度',
        type: 'line',
        smooth: true,
        data: trendData.turbidity,
        lineStyle: {
          color: '#F59E0B'
        }
      }
    ]
  }

  trendChartInstance.setOption(option)
}

// 初始化所有图表
const initCharts = async () => {
  await nextTick()

  // 延迟初始化确保DOM完全渲染
  setTimeout(() => {
    initRiskChart()
    initOrderChart()
    initStatusChart()
    initTrendChart()
  }, 100)
}

// 刷新数据
const refreshData = () => {
  // 模拟数据刷新
  console.log('刷新数据')

  // 可以在这里重新获取数据并更新图表
  if (riskChartInstance) riskChartInstance.resize()
  if (orderChartInstance) orderChartInstance.resize()
  if (statusChartInstance) statusChartInstance.resize()
  if (trendChartInstance) trendChartInstance.resize()
}

// 导出数据
const exportData = () => {
  console.log('导出数据')

  // 模拟导出功能
  const data = {
    统计概览: stats,
    危险级分析: riskData,
    工单状态: orderData,
    监测点状况: statusData,
    水质趋势: trendData,
    导出时间: new Date().toLocaleString('zh-CN')
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `监测数据统计_${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
}

// 响应式处理
const handleResize = () => {
  if (riskChartInstance) riskChartInstance.resize()
  if (orderChartInstance) orderChartInstance.resize()
  if (statusChartInstance) statusChartInstance.resize()
  if (trendChartInstance) trendChartInstance.resize()
}

// 组件挂载
onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

// 组件卸载
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)

  if (riskChartInstance) {
    riskChartInstance.dispose()
    riskChartInstance = null
  }
  if (orderChartInstance) {
    orderChartInstance.dispose()
    orderChartInstance = null
  }
  if (statusChartInstance) {
    statusChartInstance.dispose()
    statusChartInstance = null
  }
  if (trendChartInstance) {
    trendChartInstance.dispose()
    trendChartInstance = null
  }
})
</script>

<style scoped>
/* 图表容器样式 */
.echarts-container {
  width: 100%;
  height: 100%;
}

/* 统计卡片悬停效果 */
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* 滚动条样式 */
.overflow-auto::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
