import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MonitoringPoint, MonitoringData, WorkOrder, StatisticsData } from '@/types/types'

export const useMonitoringStore = defineStore('monitoring', () => {
  // 状态
  const monitoringPoints = ref<MonitoringPoint[]>([])
  const alertData = ref<MonitoringData[]>([])
  const workOrders = ref<WorkOrder[]>([])
  const statistics = ref<StatisticsData | null>(null)
  const loading = ref(false)
  const activeTab = ref('map')

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
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 模拟监测点数据
      const mockPoints: MonitoringPoint[] = [
        {
          id: '1',
          name: '长江汉口段监测点',
          location: '武汉市江岸区汉口江滩',
          latitude: 30.5956,
          longitude: 114.2847,
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: '汉江河口监测点',
          location: '武汉市硚口区汉江河口',
          latitude: 30.5742,
          longitude: 114.2486,
          status: 'maintenance',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]

      const mockStatistics: StatisticsData = {
        totalPoints: mockPoints.length,
        activePoints: mockPoints.filter(p => p.status === 'active').length,
        alertCount: {
          normal: 8,
          warning: 3,
          danger: 1,
        },
        workOrderStats: {
          pending: 6,
          in_progress: 5,
          completed: 15,
          total: 26,
        },
      }

      setMonitoringPoints(mockPoints)
      setStatistics(mockStatistics)
      setAlertData([])
      setWorkOrders([])
    } catch (error) {
      console.error('Failed to load data:', error)
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
