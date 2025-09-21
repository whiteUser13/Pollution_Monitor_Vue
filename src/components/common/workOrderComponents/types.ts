// 工单类型定义
export interface WorkOrder {
  id: number
  assigned_to: string | null
  completed_at: string | null
  created_at: string
  created_by: string
  description: string | null
  image_path: string | null
  latitude: number
  level: number | null
  longitude: number
  monitoring_point_location: string
  monitoring_point_name: string
  point_id: string
  pollutant: string | null
  status: string
  type: string
  updated_at: string
  weather: string | null
}

// 分页响应类型
export interface WorkOrderResponse {
  orders: WorkOrder[]
  pageNum: number
  pageSize: number
  total: number
}

// 监测点类型
export interface MonitoringPoint {
  id: string
  name: string
  location: string
  latitude: number
  longitude: number
  pollution_type: string
  status: string
}

// 创建工单表单数据类型
export interface CreateWorkOrderForm {
  point_id: string
  type: string
  created_by: string
  description: string
  assigned_to: string
  status: string
  image_path: string
  level: number | null
  pollutant: string
  weather: string
}

// 工单统计数据类型
export interface WorkOrderStats {
  pending: number
  in_progress: number
  completed: number
  total: number
}