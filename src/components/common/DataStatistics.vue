<template>
  <div class="h-full flex flex-col bg-gray-50">
    <!-- 统计头部 -->
    <div class="p-4 bg-white border-b">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <BarChart3 class="h-5 w-5 text-purple-600" />
          <h3 class="font-semibold text-gray-800">数据统计分析</h3>
          <Badge variant="secondary" class="text-blue-600 bg-blue-100">
            实时更新
          </Badge>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="refreshData"
            class="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
            <RefreshCw class="h-3 w-3" />
            <span>刷新</span>
          </button>
          <button
            @click="exportData"
            class="flex items-center space-x-1 px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
            <Download class="h-3 w-3" />
            <span>导出</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 主统计区域 - 按照2:1比例分为上下两块 -->
    <div class="flex-1 overflow-hidden">
      <!-- 上半部分：占比2/3 -->
      <div class="flex-1 overflow-hidden flex gap-4 mb-4">
        <!-- 监测点区域：占比1/5 -->
        <div class="w-1/5 bg-white rounded-lg shadow-sm border flex flex-col">
          <div class="p-4 border-b">
            <div class="flex items-center">
              <MapPin class="h-5 w-5 text-green-600" />
              <h3 class="font-semibold text-gray-800 ml-2">监测点状况</h3>
            </div>
          </div>

          <div class="flex-1 p-4 overflow-y-auto">
            <!-- 监测点总数 -->
            <div class="mb-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div
                    class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                    <MapPin class="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div class="text-xl font-bold text-blue-600">
                      {{ store.statistics?.totalPoints || 0 }}
                    </div>
                    <div class="text-sm text-gray-500">监测点</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 圆环图：正常运行和异常点位 -->
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="bg-gray-50 rounded-lg p-3 text-center">
                <div class="w-16 h-16 mx-auto relative">
                  <svg class="w-16 h-16" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#E5E7EB"
                      stroke-width="10" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#10B981"
                      stroke-width="10"
                      stroke-dasharray="251.2"
                      stroke-dashoffset="0"
                      transform="rotate(-90 50 50)" />
                  </svg>
                  <div
                    class="absolute inset-0 flex items-center justify-center">
                    <div class="text-lg font-bold text-gray-800">
                      {{ store.statistics?.alertCount.normal || 0 }}
                    </div>
                  </div>
                </div>
                <div class="mt-2 text-xs text-gray-600">正常运行</div>
              </div>

              <div class="bg-gray-50 rounded-lg p-3 text-center">
                <div class="w-16 h-16 mx-auto relative">
                  <svg class="w-16 h-16" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#E5E7EB"
                      stroke-width="10" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#F59E0B"
                      stroke-width="10"
                      stroke-dasharray="251.2"
                      stroke-dashoffset="0"
                      transform="rotate(-90 50 50)" />
                  </svg>
                  <div
                    class="absolute inset-0 flex items-center justify-center">
                    <div class="text-lg font-bold text-gray-800">
                      {{ store.statistics?.alertCount.warning || 0 }}
                    </div>
                  </div>
                </div>
                <div class="mt-2 text-xs text-gray-600">异常点位</div>
              </div>
            </div>

            <!-- 异常点位详情 -->
            <div class="border-t pt-4">
              <div class="flex items-center mb-3">
                <AlertTriangle class="h-4 w-4 text-red-600" />
                <h4 class="font-medium text-gray-700 ml-2">异常点位详情</h4>
              </div>
              <div class="space-y-2 max-h-40 overflow-y-auto">
                <div
                  v-for="(point, index) in alertPoints"
                  :key="index"
                  class="flex justify-between text-sm p-2 border-b">
                  <div>
                    <span class="font-semibold">{{ point.name }}</span>
                    - {{ point.location }}
                  </div>
                  <div>
                    <span
                      :class="{
                        'text-red-600': point.level === '危险',
                        'text-orange-600': point.level === '警告',
                      }">
                      {{ point.level }}
                    </span>
                    <span class="ml-2 text-gray-500">
                      持续时间: {{ point.duration }}
                    </span>
                  </div>
                </div>
              </div>
              <button class="mt-2 text-blue-600 text-sm">
                查看全部异常点位
              </button>
            </div>
          </div>
        </div>

        <!-- 工单管理区域：占比4/5 -->
        <div class="w-4/5 bg-white rounded-lg shadow-sm border flex flex-col">
          <!-- top-right-top：标题和工单状态信息 -->
          <div class="p-4 border-b">
            <div class="flex items-center mb-4">
              <FileText class="h-5 w-5 text-purple-600" />
              <h3 class="font-semibold text-gray-800 ml-2">工单管理</h3>
            </div>

            <div class="flex items-center space-x-6">
              <div class="flex items-center">
                <div
                  class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-2">
                  <FileText class="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <div class="text-lg font-bold text-yellow-600">
                    {{ store.statistics?.workOrderStats.total || 0 }}
                  </div>
                  <div class="text-xs text-gray-500">工单总数</div>
                </div>
              </div>

              <div class="flex items-center">
                <div
                  class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                  <Clock class="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div class="text-lg font-bold text-blue-600">
                    {{ store.statistics?.workOrderStats.in_progress || 0 }}
                  </div>
                  <div class="text-xs text-gray-500">处理中</div>
                </div>
              </div>

              <div class="flex items-center">
                <div
                  class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                  <CheckCircle class="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div class="text-lg font-bold text-green-600">
                    {{ store.statistics?.workOrderStats.completed || 0 }}
                  </div>
                  <div class="text-xs text-gray-500">已完成</div>
                </div>
              </div>
            </div>
          </div>

          <!-- top-right-bottom：三个图表并排显示 -->
          <div class="flex-1 p-4 overflow-auto">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- 污染类型统计 -->
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center mb-3">
                  <Tag class="h-4 w-4 text-blue-600" />
                  <h4 class="font-medium text-gray-700 ml-2">污染类型统计</h4>
                </div>
                <div ref="typeChart" class="w-full h-48"></div>
              </div>

              <!-- 污染物统计 -->
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center mb-3">
                  <Tag class="h-4 w-4 text-purple-600" />
                  <h4 class="font-medium text-gray-700 ml-2">污染物统计</h4>
                </div>
                <div ref="pollutantChart" class="w-full h-48"></div>
              </div>

              <!-- 位置分布 -->
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center mb-3">
                  <Navigation class="h-4 w-4 text-orange-600" />
                  <h4 class="font-medium text-gray-700 ml-2">位置分布</h4>
                </div>
                <div ref="locationChart" class="w-full h-48"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 下半部分：占比1/3 -->
      <div class="bg-white rounded-lg shadow-sm border flex">
        <!-- 水质参数趋势：左侧，占比2/3 -->
        <div class="w-2/3 p-4 pr-2">
          <div class="flex items-center mb-4">
            <TrendingUp class="h-5 w-5 text-blue-600" />
            <h3 class="font-semibold text-gray-800 ml-2">水质参数趋势</h3>
          </div>
          <div ref="trendChart" class="w-full h-64"></div>
        </div>

        <!-- AI分析建议：右侧，占比1/3 -->
        <div class="w-1/3 p-4 pl-2">
          <div class="flex items-center mb-4">
            <Brain class="h-5 w-5 text-purple-600" />
            <h3 class="font-semibold text-gray-800 ml-2">AI分析建议</h3>
          </div>
          <div class="space-y-3 max-h-64 overflow-y-auto">
            <div
              v-for="(suggestion, index) in aiSuggestions"
              :key="index"
              class="text-sm p-3 bg-gray-50 rounded-lg">
              <div class="text-gray-500 text-xs">{{ suggestion.time }}</div>
              <div>{{ suggestion.content }}</div>
            </div>
          </div>
          <button class="mt-2 text-blue-600 text-sm">查看历史建议</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from "vue"
import { useMonitoringStore } from "@/stores/monitoring"
import { Badge } from "@/components/ui"
import {
  BarChart3,
  MapPin,
  CheckCircle,
  AlertTriangle,
  FileText,
  PieChart,
  TrendingUp,
  RefreshCw,
  Download,
  Tag,
  Navigation,
  Clock,
  Brain,
} from "lucide-vue-next"
import * as echarts from "echarts"
import { api } from "@/utils/api"
import type { WorkOrder } from "./workOrderComponents/types"
import { formatter } from "element-plus"

const store = useMonitoringStore()

// 图表实例引用
const trendChart = ref<HTMLElement>()
const typeChart = ref<HTMLElement>()
const pollutantChart = ref<HTMLElement>()
const locationChart = ref<HTMLElement>()

// ECharts实例
let trendChartInstance: echarts.ECharts | null = null
let typeChartInstance: echarts.ECharts | null = null
let pollutantChartInstance: echarts.ECharts | null = null
let locationChartInstance: echarts.ECharts | null = null

// 添加异常点位详细模拟数据
const alertPoints = ref([
  {
    name: "A001",
    location: "河口区",
    level: "危险",
    duration: "2h",
    lastUpdate: "10:30",
  },
  {
    name: "B002",
    location: "工业区",
    level: "警告",
    duration: "1h",
    lastUpdate: "09:45",
  },
])

// 模拟AI分析数据
const aiSuggestions = ref([
  { time: "10:30", content: "预计未来2小时pH值将持续下降，建议提前干预" },
  { time: "09:15", content: "溶解氧含量恢复正常，无需额外操作" },
])

// 模拟生成30天水质数据
const generateTrendData = () => {
  const dates: string[] = []
  const ph: number[] = []
  const oxygen: number[] = []
  const turbidity: number[] = []

  // 生成过去30天日期
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    dates.push(date.toLocaleDateString("zh-CN"))
  }

  // 模拟 pH 值（日周期 + 偶尔异常）
  const basePh = 7.2
  const dailyCycle = (i: number) => Math.sin(i / 10) * 0.3 // 日周期波动
  const noise = () => (Math.random() - 0.5) * 0.2 // 随机噪声
  const anomaly = () => (Math.random() < 0.1 ? -1 : 0) // 10%概率出现异常

  for (let i = 0; i < 30; i++) {
    let value = basePh + dailyCycle(i) + noise()
    if (i === 5 || i === 15 || i === 25) {
      // 模拟污染事件
      value = Math.max(5.8, value - 1.5) // 突然下降
    }
    ph.push(parseFloat(value.toFixed(1)))
  }

  // 模拟溶解氧（白天高，晚上低）
  const baseOxygen = 8.0
  const dayNightCycle = (i: number) => Math.cos(i / 10) * 1.5 // 昼夜周期
  for (let i = 0; i < 30; i++) {
    let value = baseOxygen + dayNightCycle(i) + noise()
    if (i === 10 || i === 20) {
      // 模拟降雨后氧气上升
      value += 1.5
    }
    oxygen.push(parseFloat(value.toFixed(1)))
  }

  // 模拟浊度（雨季升高）
  const baseTurbidity = 2.0
  const rainEffect = (i: number) => (i % 7 === 0 ? 1.5 : 0) // 每周一次小雨
  for (let i = 0; i < 30; i++) {
    let value = baseTurbidity + rainEffect(i) + noise()
    if (i === 8 || i === 18) {
      // 模拟暴雨
      value += 2.0
    }
    turbidity.push(parseFloat(value.toFixed(1)))
  }

  return {
    dates,
    ph,
    oxygen,
    turbidity,
  }
}

// 初始化趋势数据
const trendData = ref(generateTrendData())

// 新增数据变量
const typeData = ref({
  categories: [] as string[],
  values: [] as number[],
  colors: [] as string[],
})

const pollutantData = ref({
  categories: [] as string[],
  values: [] as number[],
  colors: [] as string[],
})

const locationData = ref({
  categories: [] as string[],
  values: [] as number[],
  colors: [] as string[],
})

// 工具函数：获取随机颜色
const getRandomColor = () => {
  const colors = [
    "#3B82F6",
    "#F59E0B",
    "#10B981",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#F97316",
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
// 定义图表类型
type ChartType = "typeChart" | "pollutantChart" | "locationChart"

// 为不同类型图表定义专门的配色方案
const chartColors = {
  // 污染类型统计（饼图）配色
  typeChart: [
    "#5470c6", // 蓝色
    "#91cc75", // 绿色
    "#fac858", // 黄色
    "#ee6666", // 红色
    "#73c0de", // 浅蓝色
  ],

  // 污染物统计配色
  pollutantChart: [
    "#abdce7",
    "#bcd59b",
    "#a3d7bf",
    "#ddd69d",
    "#99b6d7",
    "#b6c3f1",
    "#dbbce2",
    "#f1cdce",
  ],

  // 位置分布配色
  locationChart: [
    "#73c0de", // 浅蓝色
    "#3ba272", // 深绿色
    "#fac858", // 黄色
    "#fc8452", // 橙色
    "#9a60b4", // 紫色
    "#ea7ccc", // 粉色
    "#5470c6", // 蓝色
    "#91cc75", // 绿色
  ],
}

// 获取图表颜色的函数
const getColorForChart = (chartType: ChartType, index: number) => {
  const colors = chartColors[chartType] || chartColors.typeChart
  return colors[index % colors.length]
}
// 获取所有工单数据
const fetchAllWorkOrders = async () => {
  try {
    const response = await api.get<WorkOrder[]>("/get_all_workorders")
    return response.data
  } catch (error) {
    console.error("获取所有工单失败:", error)
    return []
  }
}

// 处理工单统计数据
const processWorkOrderStats = (workOrders: WorkOrder[]) => {
  // 1. 污染物统计
  const pollutantMap = new Map<string, number>()

  // 定义需要统计的具体污染物类型
  const specificPollutants = [
    "垃圾",
    "砖块",
    "浮藻",
    "漂浮物",
    "泡沫",
    "塑料袋",
    "塑料瓶",
    "白色泡沫",
  ]

  workOrders.forEach((order) => {
    if (order.pollutant) {
      // 检查是否包含具体的污染物类型
      specificPollutants.forEach((pollutant) => {
        // 使用正则表达式进行模糊匹配，不区分中英文标点和大小写
        const regex = new RegExp(pollutant, "gi")
        const matches = order.pollutant?.match(regex)
        if (matches) {
          const currentCount = pollutantMap.get(pollutant) || 0
          pollutantMap.set(pollutant, currentCount + matches.length)
        }
      })

      // 如果没有匹配到具体污染物，但有污染物信息，则归类为"其他"
      let matched = false
      for (const pollutant of specificPollutants) {
        if (order.pollutant.includes(pollutant)) {
          matched = true
          break
        }
      }
      if (!matched && order.pollutant.trim() !== "") {
        const currentCount = pollutantMap.get("其他") || 0
        pollutantMap.set("其他", currentCount + 1)
      }
    }
  })

  // 转换为数组并排序
  const sortedPollutants = Array.from(pollutantMap.entries()).sort(
    (a, b) => b[1] - a[1],
  )

  pollutantData.value.categories = sortedPollutants.map(([name]) => name)
  pollutantData.value.values = sortedPollutants.map(([, count]) => count)
  // pollutantData.value.colors = sortedPollutants.map(() => getRandomColor())

  // 2. 污染类型统计
  const typeMap = new Map<string, number>()
  workOrders.forEach((order) => {
    if (order.type) {
      typeMap.set(order.type, (typeMap.get(order.type) || 0) + 1)
    }
  })

  const sortedTypes = Array.from(typeMap.entries()).sort((a, b) => b[1] - a[1])
  typeData.value.categories = sortedTypes.map(([name]) => name)
  typeData.value.values = sortedTypes.map(([, count]) => count)
  // typeData.value.colors = sortedTypes.map(() => getRandomColor())

  // 3. 位置分布统计
  const locationMap = new Map<string, number>()
  workOrders.forEach((order) => {
    if (order.monitoring_point_location) {
      locationMap.set(
        order.monitoring_point_location,
        (locationMap.get(order.monitoring_point_location) || 0) + 1,
      )
    }
  })

  // 取前8个最常见的位置
  const sortedLocations = Array.from(locationMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  locationData.value.categories = sortedLocations.map(([name]) => name)
  locationData.value.values = sortedLocations.map(([, count]) => count)
  // locationData.value.colors = sortedLocations.map(() => getRandomColor())
}

// 更新新图表数据
const updateNewCharts = () => {
  // 更新污染类型图表
  if (typeChartInstance) {
    typeChartInstance.setOption({
      series: [
        {
          data: typeData.value.categories.map((name, index) => ({
            name,
            value: typeData.value.values[index],
            itemStyle: { color: getColorForChart("typeChart", index) },
          })),
        },
      ],
    })
  }

  // 更新污染物图表
  if (pollutantChartInstance) {
    pollutantChartInstance.setOption({
      xAxis: { data: pollutantData.value.categories },
      series: [
        {
          data: pollutantData.value.values.map((value, index) => ({
            value,
            itemStyle: { color: getColorForChart("pollutantChart", index) },
          })),
        },
      ],
    })
  }

  // 更新位置分布图表
  if (locationChartInstance) {
    locationChartInstance.setOption({
      xAxis: { data: locationData.value.categories },
      series: [
        {
          data: locationData.value.values.map((value, index) => ({
            value,
            itemStyle: { color: getColorForChart("locationChart", index) },
          })),
        },
      ],
    })
  }
}

// 初始化污染类型统计图表 (饼图)
const initTypeChart = () => {
  if (!typeChart.value) return

  typeChartInstance = echarts.init(typeChart.value)

  const option = {
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      left: "left",
      textStyle: {
        color: "#6B7280",
      },
    },
    series: [
      {
        name: "污染类型",
        type: "pie",
        radius: ["40%", "70%"],
        // center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10, // 添加圆角
          borderColor: "#fff", // 添加边框
          borderWidth: 2, // 边框宽度
        },
        label: {
          show: false,
          // formatter: '{b}: {c} ({d}%)',
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: "14",
            fontWeight: "bold",
            formatter: "{b}\n{d}%", // 显示类型名称和百分比
          },
        },
        labelLine: {
          show: true,
        },
        data: typeData.value.categories.map((name, index) => ({
          name,
          value: typeData.value.values[index],
          itemStyle: {
            color: getColorForChart("typeChart", index),
          },
        })),
      },
    ],
  }

  typeChartInstance.setOption(option)
}

// 初始化污染物统计图表
const initPollutantChart = () => {
  if (!pollutantChart.value) return

  pollutantChartInstance = echarts.init(pollutantChart.value)

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: pollutantData.value.categories,
      axisTick: {
        alignWithLabel: true,
      },
      axisLabel: {
        color: "#6B7280",
        rotate: 45,
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#6B7280",
      },
      splitLine: {
        lineStyle: {
          color: "#E5E7EB",
        },
      },
      minInterval: 1, // 最小间隔为1
    },
    series: [
      {
        name: "数量",
        type: "bar",
        barWidth: "60%",
        data: pollutantData.value.values.map((value, index) => ({
          value,
          itemStyle: {
            color: getColorForChart("pollutantChart", index),
          },
        })),
      },
    ],
  }

  pollutantChartInstance.setOption(option)
}

// 初始化位置分布图表
const initLocationChart = () => {
  if (!locationChart.value) return

  locationChartInstance = echarts.init(locationChart.value)

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: locationData.value.categories,
      axisTick: {
        alignWithLabel: true,
      },
      axisLabel: {
        color: "#6B7280",
        // rotate: 45
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#6B7280",
      },
      splitLine: {
        lineStyle: {
          color: "#E5E7EB",
        },
      },
    },
    series: [
      {
        name: "工单数",
        type: "bar",
        barWidth: "60%",
        data: locationData.value.values.map((value, index) => ({
          value,
          itemStyle: {
            color: getColorForChart("locationChart", index),
          },
        })),
      },
    ],
  }

  locationChartInstance.setOption(option)
}

// 初始化水质参数趋势图表
const initTrendChart = () => {
  if (!trendChart.value) return

  trendChartInstance = echarts.init(trendChart.value)

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      data: ["pH值", "溶解氧", "浊度"],
      textStyle: {
        color: "#6B7280",
      },
      top: "10%",
      left: "center",
      orient: "horizontal",
      itemGap: 20,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: trendData.value.dates,
      axisLabel: {
        color: "#6B7280",
        rotate: 45,
        margin: 10,
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#6B7280",
      },
      splitLine: {
        lineStyle: {
          color: "#E5E7EB",
        },
      },
    },
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 100,
      },
      {
        type: "slider",
        bottom: "10%",
      },
    ],
    series: [
      {
        name: "pH值",
        type: "line",
        smooth: true,
        data: trendData.value.ph,
        lineStyle: {
          color: "#3B82F6",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(59, 130, 246, 0.3)" },
              { offset: 1, color: "rgba(59, 130, 246, 0.1)" },
            ],
          },
        },
        markLine: {
          label: {
            formatter: "均值",
            offset: [-1, 0],
            textStyle: {
              fontSize: 8,
              fontWeight: "bold",
            },
          },
          lineStyle: {
            type: "dashed",
            width: 1,
          },
          data: [
            {
              type: "average",
              name: "平均值",
            },
          ],
        },
        markPoint: {
          data: [
            {
              name: "异常点",
              coord: [5, trendData.value.ph[5]],
              label: {
                formatter: "污染事件",
              },
              itemStyle: {
                color: "#EF4444",
              },
            },
            {
              name: "异常点",
              coord: [15, trendData.value.ph[15]],
              label: {
                formatter: "污染事件",
              },
              itemStyle: {
                color: "#EF4444",
              },
            },
          ],
        },
      },
      {
        name: "溶解氧",
        type: "line",
        smooth: true,
        data: trendData.value.oxygen,
        lineStyle: {
          color: "#10B981",
        },
        markLine: {
          label: {
            formatter: "均值",
            offset: [-1, 0],
            textStyle: {
              fontSize: 8,
              fontWeight: "bold",
            },
          },
          lineStyle: {
            type: "dashed",
            width: 1,
          },
          data: [
            {
              type: "average",
              name: "平均值",
            },
          ],
        },
      },
      {
        name: "浊度",
        type: "line",
        smooth: true,
        data: trendData.value.turbidity,
        lineStyle: {
          color: "#F59E0B",
        },
        markLine: {
          label: {
            formatter: "均值",
            offset: [-1, 0],
            textStyle: {
              fontSize: 8,
              fontWeight: "bold",
            },
          },
          lineStyle: {
            type: "dashed",
            width: 1,
          },
          data: [
            {
              type: "average",
              name: "平均值",
            },
          ],
        },
        markPoint: {
          data: [
            {
              name: "暴雨",
              coord: [8, trendData.value.turbidity[8]],
              label: {
                formatter: "暴雨影响",
              },
              itemStyle: {
                color: "#F59E0B",
              },
            },
          ],
        },
      },
    ],
  }

  trendChartInstance.setOption(option)
}

// 更新图表数据
const updateChartData = async () => {
  if (!store.statistics) return

  // 获取所有工单并处理统计数据
  const allWorkOrders = await fetchAllWorkOrders()
  processWorkOrderStats(allWorkOrders)

  // 更新新图表
  updateNewCharts()
}

// 初始化所有图表
const initCharts = async () => {
  await nextTick()

  // 延迟初始化确保DOM完全渲染
  setTimeout(() => {
    initTrendChart()
    initTypeChart()
    initPollutantChart()
    initLocationChart()

    // 首次加载后立即更新数据
    if (store.statistics) {
      updateChartData()
    }
  }, 100)
}

// 刷新数据
const refreshData = async () => {
  // 重新加载数据
  await store.loadData()

  // 重新调整所有图表大小
  handleResize()

  // 触发数据更新
  updateChartData()
}

// 导出数据
const exportData = () => {
  console.log("导出数据")

  // 模拟导出功能
  const data = {
    统计概览: store.statistics,
    污染类型统计: typeData.value,
    污染物统计: pollutantData.value,
    位置分布: locationData.value,
    水质趋势: trendData,
    AI分析建议: aiSuggestions.value,
    导出时间: new Date().toLocaleString("zh-CN"),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `监测数据统计_${new Date().toISOString().split("T")[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
}

// 响应式处理
const handleResize = () => {
  if (trendChartInstance) trendChartInstance.resize()
  if (typeChartInstance) typeChartInstance.resize()
  if (pollutantChartInstance) pollutantChartInstance.resize()
  if (locationChartInstance) locationChartInstance.resize()
}

// 监听统计数据变化
watch(
  () => store.statistics,
  () => {
    updateChartData()
  },
  { deep: true },
)

// 组件挂载
onMounted(() => {
  initCharts()
  window.addEventListener("resize", handleResize)
})

// 组件卸载
onUnmounted(() => {
  window.removeEventListener("resize", handleResize)

  if (trendChartInstance) {
    trendChartInstance.dispose()
    trendChartInstance = null
  }
  if (typeChartInstance) {
    typeChartInstance.dispose()
    typeChartInstance = null
  }
  if (pollutantChartInstance) {
    pollutantChartInstance.dispose()
    pollutantChartInstance = null
  }
  if (locationChartInstance) {
    locationChartInstance.dispose()
    locationChartInstance = null
  }
})
</script>

<style scoped>
/* 图表容器样式 */
.echarts-container {
  width: 100%;
  height: 100%;
}

/* 卡片悬停效果 */
.card:hover {
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
