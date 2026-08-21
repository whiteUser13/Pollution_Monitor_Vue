<template>
  <div class="h-full flex flex-col">
    <!-- AI助手头部 -->
    <div class="p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
      <div class="flex items-center space-x-2 mb-2">
        <div
          class="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
          <MessageSquare class="h-4 w-4 text-white" />
        </div>
        <h3 class="font-semibold text-gray-800">AI环保知识问答</h3>
        <Badge variant="secondary" class="text-purple-600 bg-purple-100">
          智能助手
        </Badge>
      </div>
      <p class="text-sm text-gray-600">
        您好！我是智能助手，专门为河流污染监测提供专业解答。请选择快捷问题或直接提问。
      </p>
    </div>

    <!-- 快捷问题区域 -->
    <div class="p-4 border-b bg-gray-50/50">
      <div class="text-sm font-medium text-gray-700 mb-3">常见问题：</div>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="question in quickQuestions"
          :key="question.id"
          @click="handleQuickQuestion(question.text)"
          class="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-sm">
          <div class="flex items-start space-x-2">
            <HelpCircle class="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
            <span class="text-gray-700">{{ question.text }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- 聊天消息区域 -->
    <div class="flex-1 overflow-hidden flex flex-col">
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- 欢迎消息 -->
        <div v-if="messages.length === 0" class="text-center py-8">
          <div
            class="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot class="h-8 w-8 text-purple-600" />
          </div>
          <p class="text-gray-500 text-sm">开始您的智能问答之旅</p>
        </div>

        <!-- 聊天消息 -->
        <div
          v-for="message in messages"
          :key="message.id"
          :class="[
            'flex',
            message.role === 'user' ? 'justify-end' : 'justify-start',
          ]">
          <div
            :class="[
              'max-w-[80%] rounded-lg px-4 py-3',
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-200',
            ]">
            <div class="flex items-start space-x-2">
              <div
                v-if="message.role === 'assistant'"
                class="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot class="h-3 w-3 text-purple-600" />
              </div>
              <div class="flex-1">
                <div
                  class="text-sm"
                  v-html="formatMessage(message.content)"></div>
                <div class="text-xs opacity-75 mt-1">
                  {{ formatTime(message.timestamp) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 正在输入指示器 -->
        <div v-if="isTyping" class="flex justify-start">
          <div class="bg-white border border-gray-200 rounded-lg px-4 py-3">
            <div class="flex items-center space-x-2">
              <div
                class="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <Bot class="h-3 w-3 text-purple-600" />
              </div>
              <div class="flex space-x-1">
                <div
                  class="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div
                  class="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style="animation-delay: 0.1s"></div>
                <div
                  class="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style="animation-delay: 0.2s"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="p-4 border-t bg-white">
      <form @submit.prevent="sendMessage" class="flex space-x-2">
        <div class="flex-1 relative">
          <input
            v-model="inputMessage"
            type="text"
            placeholder="请输入您的问题..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
            :disabled="isTyping" />
          <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Paperclip
              class="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
        </div>
        <button
          type="submit"
          :disabled="!inputMessage.trim() || isTyping"
          class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <Send class="h-4 w-4" />
        </button>
      </form>
      <!-- 生成报告按钮 -->
      <div class="mt-3 flex justify-end">
        <button
          @click="generateReport"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
          📄 生成报告
        </button>
      </div>
      <!-- 工单选择弹窗 -->
      <div
        v-if="showWorkorderDialog"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded-lg w-96">
          <h2 class="text-lg font-semibold mb-4">请选择工单</h2>
          <select
            v-model="selectedOrderId"
            class="w-full border rounded p-2 mb-4">
            <option
              v-for="order in workorders"
              :key="order.id"
              :value="order.id">
              {{ order.monitoring_point_name }} -
              {{ order.monitoring_point_location }} (ID: {{ order.id }})
            </option>
          </select>
          <div class="flex justify-end space-x-2">
            <button
              @click="showWorkorderDialog = false"
              class="px-4 py-2 bg-gray-300 rounded">
              取消
            </button>
            <button
              @click="confirmGenerateReport"
              class="px-4 py-2 bg-blue-600 text-white rounded">
              确认
            </button>
          </div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="flex items-center justify-between mt-3 text-xs text-gray-500">
        <div class="flex items-center space-x-4">
          <button
            @click="clearHistory"
            class="hover:text-gray-700 transition-colors">
            <Trash2 class="h-3 w-3 inline mr-1" />
            清空对话
          </button>
          <button
            @click="exportHistory"
            class="hover:text-gray-700 transition-colors">
            <Download class="h-3 w-3 inline mr-1" />
            导出对话
          </button>
        </div>
        <div class="text-right">共 {{ messages.length }} 条消息</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted } from "vue"
import { Badge } from "@/components/ui"
import {
  MessageSquare,
  Bot,
  Send,
  HelpCircle,
  Paperclip,
  Trash2,
  Download,
} from "lucide-vue-next"
import axios from "axios"
import { BASE_URL, LLM_BASE_URL } from "@/utils/api"

// 消息类型定义
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

// 快捷问题定义
interface QuickQuestion {
  id: string
  text: string
}
interface WorkOrder {
  id: number
  monitoring_point_name: string
  monitoring_point_location: string
  type: string
  status: string | null
  created_at: string | null
  // 其他字段可根据需要添加
}
// 响应式数据
const messages = ref<Message[]>([])
const inputMessage = ref("")
const isTyping = ref(false)
const messagesContainer = ref<HTMLElement>()
const showWorkorderDialog = ref(false)
const workorders = ref<any[]>([])
const selectedOrderId = ref<number | null>(null)

// 快捷问题数据
const quickQuestions: QuickQuestion[] = [
  { id: "1", text: "什么区域信息监测最困难？" },
  { id: "2", text: "pH值超标对河流生态有什么影响？" },
  { id: "3", text: "如何通过数据趋势分析预测水质？" },
  { id: "4", text: "河流污染的主要来源有哪些？" },
  { id: "5", text: "监测数据异常时应该如何处理？" },
  { id: "6", text: "水质指标中哪些最关键？" },
]

const fetchAllWorkorders = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/get_all_workorders`)
    workorders.value = res.data
  } catch (e) {
    console.error("获取工单失败", e)
  }
}

// 点击“生成报告”按钮
const generateReport = async () => {
  await fetchAllWorkorders() // 从后端接口获取全部工单
  showWorkorderDialog.value = true
}

const confirmGenerateReport = async () => {
  // 1. 检查是否选择工单
  if (!selectedOrderId.value) {
    alert("请先选择工单！")
    return
  }

  // 保存当前工单ID
  const orderId = selectedOrderId.value

  // 2. 立即关闭弹窗
  showWorkorderDialog.value = false

  // 3. 插入用户消息
  const userMsg: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    role: "user",
    content: `请帮我根据ID为 ${orderId} 的工单生成报告`,
    timestamp: new Date(),
  }
  messages.value.push(userMsg)

  // 4. 插入 AI 响应占位消息
  // isTyping.value = true
  // const assistantMsg: Message = {
  //   id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  //   role: "assistant",
  //   content: " ",
  //   timestamp: new Date(),
  // }
  // messages.value.push(assistantMsg)

  let responseStr = ""
  const params = encodeURIComponent(orderId)
  const es = new EventSource(
    `${LLM_BASE_URL}/generator_stream/report?id=${params}`,
  )
  messages.value.push({
    id: generateMessageId(),
    role: "assistant",
    content: " ",
    timestamp: new Date(),
  })
  es.onmessage = (e) => {
    if (e.data === "[DONE]") {
      console.log("关闭连接")
      es.close()
      return
    }
    console.log(e.data)
    responseStr += e.data
    messages.value.pop()
    messages.value.push({
      id: generateMessageId(),
      role: "assistant",
      content: responseStr,
      timestamp: new Date(),
    })
  }
  es.onerror = (e) => console.log("err", e)
}

const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return

  const userMessage: Message = {
    id: generateMessageId(),
    role: "user",
    content: inputMessage.value.trim(),
    timestamp: new Date(),
  }

  messages.value.push(userMessage)
  const question = inputMessage.value.trim()
  inputMessage.value = ""

  // 滚动到底部
  await nextTick()
  scrollToBottom()

  simulateAIResponse(question)
}

// 处理快捷问题点击
const handleQuickQuestion = async (question: string) => {
  const userMessage: Message = {
    id: generateMessageId(),
    role: "user",
    content: question,
    timestamp: new Date(),
  }

  messages.value.push(userMessage)

  await nextTick()
  scrollToBottom()

  simulateAIResponse(question)
}

const simulateAIResponse = function (question) {
  let responseStr = ""
  const params = encodeURIComponent(question)
  const es = new EventSource(`${LLM_BASE_URL}/chat_stream?question=${params}`)
  messages.value.push({
    id: generateMessageId(),
    role: "assistant",
    content: " ",
    timestamp: new Date(),
  })
  es.onmessage = (e) => {
    if (e.data === "[DONE]") {
      console.log("关闭连接")
      es.close()
      return
    }
    console.log(e.data)
    responseStr += e.data
    messages.value.pop()
    messages.value.push({
      id: generateMessageId(),
      role: "assistant",
      content: responseStr,
      timestamp: new Date(),
    })
  }
  es.onerror = (e) => console.log("err", e)
}
const formatMessage = function (message) {
  // 处理粗体
  // 转义 HTML 特殊字符，防止 XSS
  // message = message
  //   .replace(/&/g, "&amp;")
  //   .replace(/</g, "&lt;")
  //   .replace(/>/g, "&gt;")
  message = message.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  message = message.replace(/ \* /g, "<br>")
  // message = message.replace(/^###\s*(.+)$/gm, "<h1>$1</h1>")
  message = message.replace(/###/gm, "<br>")
  // message = message.replace(/^###\s*(.+)$/gm, "<h1>$1</h1><br>")

  return message
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 格式化消息内容
// const formatMessage = (content: string): string => {
//   return content
// }

// 格式化时间
const formatTime = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

// 清空对话历史
const clearHistory = () => {
  if (confirm("确定要清空所有对话记录吗？")) {
    messages.value = []
  }
}

// 导出对话历史
const exportHistory = () => {
  const content = messages.value
    .map((msg) => {
      const role = msg.role === "user" ? "用户" : "AI助手"
      const time = formatTime(msg.timestamp)
      return `[${time}] ${role}: ${msg.content.replace(/<[^>]*>/g, "")}`
    })
    .join("\n\n")

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `AI对话记录_${new Date().toISOString().split("T")[0]}.txt`
  link.click()
  URL.revokeObjectURL(url)
}

// 组件挂载时的初始化
onMounted(() => {
  // 可以在这里添加初始化逻辑
})
</script>

<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>
