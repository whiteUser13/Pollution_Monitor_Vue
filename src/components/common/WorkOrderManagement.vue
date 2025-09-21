<template>
  <div class="h-full flex flex-col space-y-4">
    <!-- 工单概览组件 -->
    <OrderOverview :work-order-stats="workOrderStats" />

    <!-- 工单列表组件 -->
    <OrderList ref="workOrderListRef" @create-order="handleShowCreateDialog" />

    <!-- 创建工单对话框组件 -->
    <OrderDialog v-model:show="showCreateDialog" @success="handleCreateSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import OrderList from './workOrderComponents/OrderList.vue'
import OrderDialog from './workOrderComponents/OrderDialog.vue'
import OrderOverview from './workOrderComponents/OrderOverview.vue'
import type { WorkOrderStats } from './workOrderComponents/types'

// Props
interface Props {
  workOrderStats?: WorkOrderStats
}

defineProps<Props>()

// 响应式数据
const showCreateDialog = ref(false)
const workOrderListRef = ref()

// 事件处理
const handleShowCreateDialog = () => {
  showCreateDialog.value = true
}

const handleCreateSuccess = () => {
  // 创建成功后刷新工单列表
  workOrderListRef.value?.refresh()
}
</script>
