<template>
  <div class="h-full flex flex-col space-y-4">
    <!-- 地图区域 -->
    <Card class="flex-1 bg-white/90 backdrop-blur-sm border-blue-200">
      <CardHeader class="pb-3">
        <CardTitle class="text-lg flex items-center space-x-2">
          <MapPin class="h-5 w-5 text-blue-600" />
          <span>监测点分布图</span>
          <Badge variant="secondary" class="ml-auto">
            {{ monitoringPoints?.length || 0 }} 个监测点
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent class="p-0 flex-1">
        <div class="h-[400px] relative rounded-lg overflow-hidden">
          <Map :center="mapCenter" class="w-full h-full" />
        </div>
      </CardContent>
    </Card>

    <!-- 监测点列表 -->
    <Card class="bg-white/90 backdrop-blur-sm border-blue-200">
      <CardHeader class="pb-3">
        <CardTitle class="text-lg flex items-center space-x-2">
          <Navigation class="h-5 w-5 text-blue-600" />
          <span>监测点列表</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div v-for="point in monitoringPoints" :key="point.id" :class="[
            'p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md',
            selectedPoint?.id === point.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-blue-300'
          ]" @click="handlePointClick(point)">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-1">
                  <h4 class="font-medium text-gray-900 text-sm">{{ point.name }}</h4>
                  <Badge variant="secondary" :class="getStatusColor(point.status)">
                    <span class="flex items-center space-x-1">
                      <component :is="getStatusIcon(point.status)" class="h-4 w-4" />
                      <span>{{ getStatusText(point.status) }}</span>
                    </span>
                  </Badge>
                </div>
                <p class="text-xs text-gray-600 mb-2">{{ point.location }}</p>
                <div class="text-xs text-gray-500">
                  <div>纬度: {{ Number(point.latitude).toFixed(4) }}</div>
                  <div>经度: {{ Number(point.longitude).toFixed(4) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!monitoringPoints || monitoringPoints.length === 0" class="text-center py-8 text-gray-500">
          <MapPin class="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>暂无监测点数据</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { MapPin, Navigation, Zap, AlertTriangle, CheckCircle } from 'lucide-vue-next'
import { Map } from '@/components/ui'
import type { MonitoringPoint } from '@/types/types'

interface Props {
  monitoringPoints: MonitoringPoint[]
  onPointSelect?: (point: MonitoringPoint) => void
}

const props = withDefaults(defineProps<Props>(), {
  monitoringPoints: () => [],
  onPointSelect: undefined
})

const emit = defineEmits<{
  pointSelect: [point: MonitoringPoint]
}>()

const selectedPoint = ref<MonitoringPoint | null>(null)
const mapCenter = ref({ lat: 30.5928, lng: 114.3055 }) // 武汉市中心

const handlePointClick = (point: MonitoringPoint) => {
  selectedPoint.value = point
  mapCenter.value = { lat: Number(point.latitude), lng: Number(point.longitude) }
  props.onPointSelect?.(point)
  emit('pointSelect', point)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-100'
    case 'maintenance':
      return 'text-orange-600 bg-orange-100'
    case 'inactive':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return CheckCircle
    case 'maintenance':
      return AlertTriangle
    case 'inactive':
      return Zap
    default:
      return MapPin
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return '正常运行'
    case 'maintenance':
      return '维护中'
    case 'inactive':
      return '离线'
    default:
      return '未知'
  }
}
</script>
