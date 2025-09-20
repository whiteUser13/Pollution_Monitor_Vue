// 监测点接口
export interface MonitoringPoint {
  id: string
  name: string
  location: string
  latitude: number
  longitude: number
  status: "active" | "inactive" | "maintenance"
  created_at: string
  updated_at: string
  pollution_type: string
  image_path: string
  video_path: string
  level: number
}

// 监测数据接口
export interface MonitoringData {
  id: string
  point_id: string
  ph_value?: number
  dissolved_oxygen?: number
  turbidity?: number
  temperature?: number
  conductivity?: number
  ammonia_nitrogen?: number
  cod?: number
  alert_level: "normal" | "warning" | "danger"
  recorded_at: string
  created_at: string
  monitoring_point?: MonitoringPoint
}

// 工单接口
export interface WorkOrder {
  id: string
  title: string
  description?: string
  type: "pollution_incident" | "maintenance" | "inspection"
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in_progress" | "completed" | "cancelled"
  point_id?: string
  assigned_to?: string
  created_by: string
  created_at: string
  updated_at: string
  completed_at?: string
  monitoring_point?: MonitoringPoint
}

// AI聊天消息接口
export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string | ContentPart[]
  id?: string
}

export type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }

// 统计数据接口
export interface StatisticsData {
  totalPoints: number
  activePoints: number
  alertCount: {
    normal: number
    warning: number
    danger: number
  }
  workOrderStats: {
    pending: number
    in_progress: number
    completed: number
    total: number
  }
}
