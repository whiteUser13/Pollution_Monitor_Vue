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
    removeLegend()
    removeMarkers()
    const grades = ["无污染", "轻微污染", "较为严重", "严重污染"] // 可对应绿、黄、红
    const colors = ["green", "yellow", "orange", "red"]
    addLegend(colors, grades, map)
    addMakerLayer(newVal, grades, colors)
  },
  { deep: true },
)
watch(
  () => props.center,
  (newVal) => {
    if (map) {
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
// window.showImage = showImage
const url = "http://60.205.12.90:5012/"
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
  //添加marker图层
  markerLayer = L.layerGroup().addTo(map)
  if (props.points) {
    removeMarkers()
    const grades = ["无污染", "轻微污染", "较为严重", "严重污染"] // 可对应绿、黄、红
    const colors = ["green", "yellow", "orange", "red"]
    addLegend(colors, grades, map)
    addMakerLayer(props.points, grades, colors)
  }
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

  points.forEach((el) => {
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
</script>
<style scoped>
#map {
  position: absolute;
  width: 100%;
  height: 100%;

  background-color: gray;
}
</style>
