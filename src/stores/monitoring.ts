import { defineStore } from "pinia"
import { ref } from "vue"
import type {
  MonitoringPoint,
  MonitoringData,
  WorkOrder,
  StatisticsData,
} from "@/types/types"
import axios from "axios"

export const useMonitoringStore = defineStore("monitoring", () => {
  // 状态
  const monitoringPoints = ref<MonitoringPoint[]>([])
  const alertData = ref<MonitoringData[]>([])
  const workOrders = ref<WorkOrder[]>([])
  const statistics = ref<StatisticsData | null>(null)
  const loading = ref(false)
  const activeTab = ref("map")

  // 操作
  const setMonitoringPoints = (points: MonitoringPoint[]) => {
    monitoringPoints.value = points
  }

  const setAlertData = (alerts: MonitoringData[]) => {
    alertData.value = alerts
  }

  const setWorkOrders = (orders: WorkOrder[]) => {
    workOrders.value = orders
  }

  const setStatistics = (stats: StatisticsData) => {
    statistics.value = stats
  }

  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const setActiveTab = (tab: string) => {
    activeTab.value = tab
  }

  // 模拟数据加载（后续替换为真实API）
  const loadData = async () => {
    setLoading(true)
    let url = "http://60.205.12.90:5012"
    try {
      // 模拟API延迟
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const [pointsRes, alertCountInfo, workOrderStatsInfo] = await Promise.all(
        [
          axios.get(url + "/get_monitoring_info"),
          axios.get(url + "/get_point_level_stats"),
          axios.get(url + "/get_order_status_stats"),
        ]
      )
      console.log(alertCountInfo)
      console.log(workOrderStatsInfo)

      setMonitoringPoints(pointsRes.data)

      // 模拟监测点数据
      setAlertData([])
      setWorkOrders([])

      const pointStatistics: StatisticsData = {
        totalPoints: monitoringPoints.value.length,
        activePoints: monitoringPoints.value.filter(
          (p) => p.status === "active"
        ).length,
        alertCount: {
          normal: alertCountInfo.data.normal_count,
          warning: alertCountInfo.data.warning_count,
          danger: alertCountInfo.data.danger_count,
        },
        workOrderStats: {
          pending: workOrderStatsInfo.data.pending_count,
          in_progress: workOrderStatsInfo.data.in_progress_count,
          completed: workOrderStatsInfo.data.completed_count,
          total: workOrderStatsInfo.data.total,
        },
      }

      setStatistics(pointStatistics)
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  return {
    // 状态
    monitoringPoints,
    alertData,
    workOrders,
    statistics,
    loading,
    activeTab,
    // 操作
    setMonitoringPoints,
    setAlertData,
    setWorkOrders,
    setStatistics,
    setLoading,
    setActiveTab,
    loadData,
  }
})
