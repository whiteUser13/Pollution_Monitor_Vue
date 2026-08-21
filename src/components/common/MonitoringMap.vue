<template>
  <div class="flex flex-col space-y-4">
    <!-- 地图区域 -->
    <Card
      class="h-[60vh] flex flex-col bg-white/90 backdrop-blur-sm border-blue-200">
      <CardHeader class="pb-3">
        <CardTitle class="text-lg flex items-center space-x-2">
          <MapPin class="h-5 w-5 text-blue-600" />
          <span>监测点分布图</span>
          <Badge variant="secondary" class="ml-auto">
            {{ monitoringPoints.length || 0 }} 个监测点
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent class="p-0 flex-1">
        <div class="h-full relative rounded-lg overflow-hidden">
          <Map
            @markerSelected="handleMarkerSelected"
            :center="mapCenter"
            :points="monitoringPoints"
            class="w-full h-full" />
        </div>
      </CardContent>
    </Card>

    <!-- 监测点列表 -->
    <div class="h-[30vh] grid grid-cols-2 gap-3">
      <Card
        class="grid overflow-auto grid-cols-1 bg-white/90 backdrop-blur-sm border-blue-200">
        <div class="overflow-auto">
          <CardHeader class="pb-3">
            <CardTitle class="text-lg flex items-center space-x-2">
              <Navigation class="h-5 w-5 text-blue-600" />
              <span>监测点列表</span>
            </CardTitle>
          </CardHeader>
          <CardContent class="grid grid-cols-1 gap-3">
            <div class="grid grid-cols-1 md:grid-cols-1 gap-3">
              <div
                v-for="point in monitoringPoints"
                :key="point.id"
                :class="[
                  'p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md',
                  selectedPoint && selectedPoint.id === point.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300',
                ]"
                @click="handlePointClick(point)">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-1">
                      <h4 class="font-medium text-gray-900 text-sm">
                        {{ point.name }}
                      </h4>
                      <Badge
                        variant="secondary"
                        :class="getStatusColor(point.status)">
                        <span class="flex items-center space-x-1">
                          <component
                            :is="getStatusIcon(point.status)"
                            class="h-4 w-4" />
                          <span>{{ getStatusText(point.status) }}</span>
                        </span>
                      </Badge>
                    </div>
                    <p class="text-xs text-gray-600 mb-2">
                      {{ point.location }}
                    </p>
                    <div class="text-xs text-gray-500">
                      <div>纬度: {{ Number(point.latitude).toFixed(4) }}</div>
                      <div>经度: {{ Number(point.longitude).toFixed(4) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-if="!monitoringPoints || monitoringPoints.length === 0"
              class="text-center py-8 text-gray-500">
              <MapPin class="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>暂无监测点数据</p>
            </div>
          </CardContent>
        </div>
      </Card>

      <Card class="grid overflow-auto grid-cols-1">
        <CardHeader>
          <CardTitle class="text-lg flex items-center">
            <span>监测点监控视频</span>
          </CardTitle>
        </CardHeader>
        <CardContent
          class="w-full h-full flex items-center justify-center overflow-hidden">
          <video
            class="max-w-full max-h-full object-contain"
            ref="videoRef"
            playsinline
            controls
            :src="videoSrc"></video>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted } from "vue"
import L from "leaflet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Badge } from "@/components/ui"
import {
  MapPin,
  Navigation,
  Zap,
  AlertTriangle,
  CheckCircle,
} from "lucide-vue-next"
import { Map } from "@/components/ui"
import { BASE_URL } from "@/utils/api"

onMounted(() => {
  videoRef.value.loop = true
  videoRef.value.muted = true
  videoRef.value.autoplay = true
  videoRef.value.play()
})

// Props 和 emit
const props = defineProps({
  monitoringPoints: {
    type: Array,
    default: () => [],
  },
  onPointSelect: {
    type: Function,
    default: undefined,
  },
})
const videoRef = ref()
const emit = defineEmits(["pointSelect"])
let markers = null
let videoSrc = ref("")
// 响应式变量
const selectedPoint = ref(null)
const mapCenter = ref({ lat: 39.91402, lng: 116.403197 }) // 武汉市中心

// 方法

const handlePointClick = (point) => {
  selectedPoint.value = point
  mapCenter.value = {
    id: point.id,
    lat: Number(point.latitude),
    lng: Number(point.longitude),
  }
  videoSrc.value = BASE_URL + "/" + point.video_path
  if (props.onPointSelect) {
    props.onPointSelect(point)
  }

  emit("pointSelect", point)
}
const handleMarkerSelected = (poi_id) => {
  const point = props.monitoringPoints.find((p) => p.id === poi_id)
  videoSrc.value = BASE_URL + "/" + point.video_path
}
const getStatusColor = (status) => {
  switch (status) {
    case "active":
      return "text-green-600 bg-green-100"
    case "maintenance":
      return "text-orange-600 bg-orange-100"
    case "inactive":
      return "text-red-600 bg-red-100"
    default:
      return "text-gray-600 bg-gray-100"
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case "active":
      return CheckCircle
    case "maintenance":
      return AlertTriangle
    case "inactive":
      return Zap
    default:
      return MapPin
  }
}

const getStatusText = (status) => {
  switch (status) {
    case "active":
      return "正常运行"
    case "maintenance":
      return "维护中"
    case "inactive":
      return "离线"
    default:
      return "未知"
  }
}
</script>
