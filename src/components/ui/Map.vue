<template>
  <div :class="cn('bg-gray-100 rounded-lg flex items-center justify-center text-gray-500', $attrs.class)"
    v-bind="$attrs">
    <div class="text-center">
      <p class="text-lg font-medium">地图组件</p>
      <p class="text-sm">待后续实现</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  class?: string
  center?: { lat: number; lng: number }
  markers?: Array<{
    id: string
    lat: number
    lng: number
    title?: string
  }>
}

defineProps<Props>()
</script>
