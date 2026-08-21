<template>
  <div
    id="map"
    :class="
      cn(
        'bg-gray-100 rounded-lg flex items-center justify-center text-gray-500',
        $attrs.class,
      )
    "
    v-bind="$attrs"></div>
</template>

<script setup>
import { cn } from "@/lib/utils"
import { onMounted, ref, watch, defineEmits } from "vue"
import L from "leaflet"
import "@/utils/geoAnimation/L.Icon.Pulse.js"
// import { KqMapView } from "@kq_npm/client_leaflet_vue"
import * as turf from "@turf/turf"
import { BASE_URL } from "@/utils/api"
const props = defineProps({
  class: String,
  center: Object,
  points: Array,
})

// 定义事件（父组件会监听这个事件）
const emit = defineEmits(["markerSelected"])
watch(
  () => props.points,
  (newVal) => {
    refreshPointLayers(newVal)
  },
  { deep: true },
)
watch(
  () => props.center,
  (newVal) => {
    if (map && markerLayer) {
      const marker = findMarkerById(newVal.id)
      if (marker) {
        marker.openPopup() // 打开 popup
        map.panTo([newVal.lat, newVal.lng], {
          animate: true,
          duration: 1.0, // 秒
        })
      }
    }
  },
  { deep: true },
)
// vue3用了ref来定义leaflet的接收值，控制台会报错,不要使用.value复制
let map = null
let markerLayer = null
let legend = null
let bufferLayer = null
let bufferLabelLayer = null
const bufferLabelMinZoom = 15
const grades = ["无污染", "轻微污染", "较为严重", "严重污染"] // 可对应绿、黄、红
const colors = ["green", "yellow", "orange", "red"]
// window.showImage = showImage
const url = `${BASE_URL}/`
onMounted(() => {
  initMap()
})
const initMap = () => {
  map = L.map("map", {
    attributionControl: true,
    center: [props.center.lat, props.center.lng],
    zoom: 10,
  })
  //控制地图底图
  var baseLayers = {
    //天地图tk可以换成自己申请的key
    天地图: L.layerGroup([
      L.tileLayer(
        "http://t{s}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=56b81006f361f6406d0e940d2f89a39c",
        { subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"] },
      ),
      L.tileLayer(
        "http://t{s}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=56b81006f361f6406d0e940d2f89a39c",
        { subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"] },
      ),
    ]).addTo(map),
    天地图影像: L.layerGroup([
      L.tileLayer(
        "http://t{s}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=56b81006f361f6406d0e940d2f89a39c",
        { subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"] },
      ),
      L.tileLayer(
        "http://t{s}.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=56b81006f361f6406d0e940d2f89a39c",
        { subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"] },
      ),
    ]),
    天地图地形: L.layerGroup([
      L.tileLayer(
        "http://t{s}.tianditu.gov.cn/ter_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=56b81006f361f6406d0e940d2f89a39c",
        { subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"] },
      ),
      L.tileLayer(
        "http://t{s}.tianditu.gov.cn/cta_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cta&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=56b81006f361f6406d0e940d2f89a39c",
        { subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"] },
      ),
    ]),
    高德地图: L.tileLayer(
      "http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
      { subdomains: "1234" },
    ),
    高德影像: L.layerGroup([
      L.tileLayer(
        "http://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
        { subdomains: "1234" },
      ),
      L.tileLayer(
        "http://webst0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8",
        { subdomains: "1234" },
      ),
    ]),
    OSM: L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png"),
  }
  // 创建图例控件
  L.control.layers(baseLayers, {}, { position: "topright" }).addTo(map)
  bufferLayer = L.geoJSON(null, {
    style: {
      color: "#2563eb",
      weight: 2,
      opacity: 0.85,
      fillColor: "#60a5fa",
      fillOpacity: 0.22,
    },
    interactive: false,
  }).addTo(map)
  bufferLabelLayer = L.layerGroup()
  //添加marker图层
  markerLayer = L.layerGroup().addTo(map)
  map.on("zoomend", updateBufferLabelVisibility)
  refreshPointLayers(props.points)
}

function generateMarker(
  latlng,
  infoObj,
  imagePath,
  markerId,
  title,
  titleColor = "red",
  markerColor = "red",
) {
  let lat = latlng[0]
  let lng = latlng[1]

  let pulsingIcon = L.icon.pulse({
    iconAnchor: [10, 10],
    iconSize: [16, 16],
    color: markerColor,
    fillColor: markerColor,
    animate: true, // 是否动画
    heartbeat: 1.5, // 动画周期，单位秒
  })
  let marker = L.marker([lat, lng], {
    icon: pulsingIcon,
    id: markerId,
  })
  // 绑定点击事件
  marker.on("click", (e) => {
    emit("markerSelected", e.target.options.id)
  })
  const keys = Object.keys(infoObj)
  let infoContent = `<div><strong style="color:${titleColor};">${title}</strong><br>`
  for (let j = 0; j < keys.length; j++) {
    if (j != keys.length - 1) {
      infoContent =
        infoContent +
        `<span style="font-size:12px;"><strong>${keys[j]}: </strong>${
          infoObj[keys[j]]
        }</span><br>`
    } else {
      infoContent =
        infoContent +
        `<span style="font-size:12px;"><strong>${keys[j]}:</strong> ${
          infoObj[keys[j]]
        }</span></div>`
    }
  }
  infoContent =
    infoContent +
    `<a href="${imagePath}" data-lightbox="monitor">
    <img src="${imagePath}"
         alt="监测点图片"
         style="margin-top:5px;" />
  </a>`
  marker.bindPopup(infoContent, {
    permanent: false, // 鼠标悬停显示
    className: "custom-tooltip", // 自定义 CSS
  })
  return marker
}
const addLegend = (colorArr, textArr, toMap) => {
  legend = L.control({ position: "bottomright" })
  legend.onAdd = (map) => {
    const div = L.DomUtil.create("div", "info legend")
    let html = ""
    for (let i = 0; i < textArr.length; i++) {
      html += `<i style="background:${colorArr[i]}; width:36px; height:18px; display:inline-block;vertical-align: middle; margin-right:5px;margin-bottom:4px;"></i>${textArr[i]}<br>`
    }
    div.innerHTML = html
    div.style.padding = "6px"
    div.style.background = "white"
    div.style.border = "1px solid #ccc"
    div.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)"
    return div
  }
  legend.addTo(toMap)
}
const addMakerLayer = (points, grades, colors) => {
  console.log("addmarkerLayer")

  normalizePoints(points).forEach((el) => {
    let pointInfo = {
      监测点名称: el.name,
      位置: el.location,
      状态: getStatusStr(el.status),
      更新时间: el.updated_at,
      污染类型: el.pollution_type,
      污染等级: grades[el.level],
    }
    let imgPath = url + el.image_path
    let marker = generateMarker(
      [el.latitude, el.longitude],
      pointInfo,
      imgPath,
      el.id,
      "监测点信息",
      "red",
      colors[el.level],
    )
    console.log("添加点")

    markerLayer.addLayer(marker)
  })
}
const refreshPointLayers = (points) => {
  if (!map || !markerLayer || !bufferLayer || !bufferLabelLayer) return

  removeLegend()
  removeMarkers()
  removeBufferLayer()
  removeBufferLabels()

  if (!Array.isArray(points) || points.length === 0) return

  addLegend(colors, grades, map)
  addBufferLayer(points, 50) // 添加缓冲区图层，缓冲区半径为50米
  addBufferLabels(points, 50)
  addMakerLayer(points, grades, colors)
  updateBufferLabelVisibility()
}
const normalizePoints = (points) => {
  if (!Array.isArray(points)) return []

  return points
    .map((point) => ({
      ...point,
      latitude: Number(point.latitude),
      longitude: Number(point.longitude),
    }))
    .filter(
      (point) =>
        Number.isFinite(point.latitude) && Number.isFinite(point.longitude),
    )
}
const addBufferLayer = (points, bufferDistance = 50) => {
  const bufferFeatures = normalizePoints(points)
    .map((point) => {
      const pt = turf.point([point.longitude, point.latitude])
      return turf.buffer(pt, bufferDistance, { units: "meters", steps: 64 })
    })
    .filter(Boolean)

  if (bufferFeatures.length === 0) return

  const bufferCollection = turf.featureCollection(bufferFeatures)
  bufferLayer.clearLayers()
  bufferLayer.addData(bufferCollection)
}
const addBufferLabels = (points, bufferDistance = 50) => {
  normalizePoints(points).forEach((point) => {
    const pt = turf.point([point.longitude, point.latitude])
    const labelPoint = turf.destination(
      pt,
      point.buffer_distance ? point.buffer_distance : 0,
      0,
      {
        units: "meters",
      },
    )
    const [lng, lat] = labelPoint.geometry.coordinates
    const label = L.marker([lat, lng], {
      interactive: false,
      icon: L.divIcon({
        className: "ai-buffer-label-icon",
        html: '<span class="ai-buffer-label">AI预测污染区域</span>',
        iconAnchor: [48, 8],
      }),
    })

    bufferLabelLayer.addLayer(label)
  })
}
const updateBufferLabelVisibility = () => {
  if (!map || !bufferLabelLayer) return

  if (map.getZoom() >= bufferLabelMinZoom) {
    if (!map.hasLayer(bufferLabelLayer)) {
      bufferLabelLayer.addTo(map)
    }
    return
  }

  if (map.hasLayer(bufferLabelLayer)) {
    map.removeLayer(bufferLabelLayer)
  }
}
const getStatusStr = (status) => {
  switch (status) {
    case "active":
      return "正在运行"
    case "maintenance":
      return "维护中"
    case "inactive":
      return "已关闭"
    default:
      return "异常"
  }
}
const removeMarkers = () => {
  if (!markerLayer) return
  markerLayer.clearLayers() // 清空整个 layerGroup
}
const findMarkerById = (id) => {
  let found = null
  markerLayer.eachLayer((layer) => {
    if (layer.options && layer.options.id === id) {
      found = layer
    }
  })
  return found
}
const removeLegend = () => {
  if (legend) {
    map.removeControl(legend)
    legend = null
  }
}
const removeBufferLayer = () => {
  if (!bufferLayer) return
  bufferLayer.clearLayers()
}
const removeBufferLabels = () => {
  if (!bufferLabelLayer) return
  bufferLabelLayer.clearLayers()
}
</script>
<style scoped>
#map {
  position: absolute;
  width: 100%;
  height: 100%;

  background-color: gray;
}

:deep(.ai-buffer-label-icon) {
  pointer-events: none;
}

:deep(.ai-buffer-label) {
  display: inline-block;
  padding: 2px 6px;
  border: 0;
  border-radius: 4px;
  background: rgba(37, 99, 235, 0.82);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.24);
  pointer-events: none;
  white-space: nowrap;
}
</style>
