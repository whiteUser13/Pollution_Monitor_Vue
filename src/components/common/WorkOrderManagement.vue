<template>
  <div class="h-full flex flex-col space-y-4">
    <!-- 工单概览组件 -->
    <OrderOverview ref="orderOverviewRef" />

    <!-- 工单列表组件 -->
    <OrderList ref="workOrderListRef" @create-order="handleShowCreateDialog" @show-detail="handleShowDetailDialog" />

    <!-- 创建工单对话框组件 -->
    <OrderDialog v-model:show="showCreateDialog" @success="handleCreateSuccess" />

    <!-- 工单详情对话框组件 -->
    <OrderDetail v-model:show="showDetailDialog" :work-order="selectedWorkOrder"
      @success="handleDetailEditSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import OrderList from './workOrderComponents/OrderList.vue'
import OrderDialog from './workOrderComponents/OrderDialog.vue'
import OrderOverview from './workOrderComponents/OrderOverview.vue'
import OrderDetail from './workOrderComponents/OrderDetail.vue'
import type { WorkOrder } from './workOrderComponents/types'

// 响应式数据
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const workOrderListRef = ref()
const orderOverviewRef = ref()
const selectedWorkOrder = ref<WorkOrder | null>(null)

// 事件处理
const handleShowCreateDialog = () => {
  showCreateDialog.value = true
}

const handleShowDetailDialog = (workOrder: WorkOrder) => {
  selectedWorkOrder.value = workOrder
  showDetailDialog.value = true
}

const handleCreateSuccess = () => {
  // 创建成功后刷新工单列表和概览统计
  workOrderListRef.value?.refresh()
  orderOverviewRef.value?.refresh()
}

const handleDetailEditSuccess = () => {
  // 编辑成功后刷新工单列表和概览统计
  workOrderListRef.value?.refresh()
  orderOverviewRef.value?.refresh()
}
</script>
