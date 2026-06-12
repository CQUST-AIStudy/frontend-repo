<script setup>
import * as echarts from 'echarts'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { KNOWLEDGE_STATUS } from '../knowledgeGraphData'

const props = defineProps({
  nodes: {
    type: Array,
    default: () => []
  },
  links: {
    type: Array,
    default: () => []
  },
  selectedNodeId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['hover-node', 'leave-node', 'play-demo'])

const chartRef = ref(null)
let chartInstance = null

const hasGraphData = computed(() => props.nodes.length > 0 && props.links.length > 0)

function statusMeta(status) {
  if (status === 'core') {
    return {
      label: '课程核心',
      color: '#1270d8',
      softColor: '#dbeafe',
      textColor: '#fff'
    }
  }
  return KNOWLEDGE_STATUS[status] || KNOWLEDGE_STATUS.unlearned
}

function wrapLabel(name) {
  const text = String(name || '').replace(/\n/g, '')
  if (text.length <= 4) return text
  if (text.length <= 8) return `${text.slice(0, 4)}\n${text.slice(4)}`
  return `${text.slice(0, 4)}\n${text.slice(4, 8)}`
}

function buildChartNodes() {
  return props.nodes.map(node => {
    const meta = statusMeta(node.status)
    const selected = node.id === props.selectedNodeId
    return {
      id: node.id,
      name: node.label || node.name,
      x: node.x,
      y: node.y,
      value: node.status,
      cursor: node.type === 'knowledge' ? 'pointer' : 'default',
      symbolSize: node.symbolSize,
      itemStyle: {
        color: meta.color,
        borderColor: selected ? '#0f172a' : '#fff',
        borderWidth: selected ? 5 : 2,
        shadowBlur: node.type === 'root' ? 24 : selected ? 20 : 12,
        shadowColor: selected ? 'rgba(15, 23, 42, 0.24)' : `${meta.color}33`
      },
      label: {
        show: true,
        formatter: wrapLabel(node.label || node.name),
        color: node.status === 'good' || node.status === 'core' || node.status === 'weak' ? '#fff' : meta.textColor,
        fontSize: node.type === 'root' ? 14 : node.type === 'group' ? 12 : 11,
        fontWeight: node.type === 'root' || node.type === 'group' ? 800 : 700,
        lineHeight: 15
      },
      originalNode: node
    }
  })
}

function buildChartLinks() {
  const nodeMap = Object.fromEntries(props.nodes.map(node => [node.id, node]))
  return props.links.map(link => {
    const targetNode = nodeMap[link.target]
    const meta = statusMeta(targetNode?.status)
    return {
      source: link.source,
      target: link.target,
      lineStyle: {
        color: meta.color,
        opacity: 0.45,
        width: targetNode?.type === 'group' ? 1.8 : 1.2,
        curveness: 0.08
      }
    }
  })
}

function handleChartClick(params) {
  if (params.dataType !== 'node') return
  const node = params.data.originalNode
  if (node?.type !== 'knowledge') return
  emit('play-demo', node)
}

function handleChartMouseOver(params) {
  if (params.dataType !== 'node') return
  emit('hover-node', params.data.originalNode)
}

function handleChartMouseOut(params) {
  if (params.dataType !== 'node') return
  emit('leave-node')
}

function handleChartGlobalOut() {
  emit('leave-node')
}

function renderChart() {
  if (!chartInstance || !hasGraphData.value) return

  chartInstance.setOption({
    animationDuration: 700,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      borderWidth: 0,
      textStyle: { color: '#fff' },
      formatter(params) {
        if (params.dataType !== 'node') return ''
        const node = params.data.originalNode
        const meta = statusMeta(node.status)
        return [
          `<strong>${node.label || node.name}</strong>`,
          node.type === 'root' ? meta.label : `状态：${meta.label}`,
          node.parentName ? `模块：${node.parentName}` : '',
          node.description || ''
        ].filter(Boolean).join('<br/>')
      }
    },
    series: [
      {
        type: 'graph',
        layout: 'none',
        roam: true,
        scaleLimit: { min: 0.75, max: 1.8 },
        data: buildChartNodes(),
        links: buildChartLinks(),
        edgeSymbol: ['none', 'none'],
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 2.4,
            opacity: 0.85
          }
        }
      }
    ]
  }, true)
}

function resizeChart() {
  chartInstance?.resize()
}

async function initChart() {
  await nextTick()
  if (!chartRef.value || !hasGraphData.value) return
  chartInstance = echarts.init(chartRef.value)
  chartInstance.on('click', handleChartClick)
  chartInstance.on('mouseover', handleChartMouseOver)
  chartInstance.on('mouseout', handleChartMouseOut)
  chartInstance.on('globalout', handleChartGlobalOut)
  renderChart()
  setTimeout(resizeChart, 80)
}

watch(
  () => [props.nodes, props.links, props.selectedNodeId],
  () => {
    renderChart()
  },
  { deep: true }
)

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance?.off('click', handleChartClick)
  chartInstance?.off('mouseover', handleChartMouseOver)
  chartInstance?.off('mouseout', handleChartMouseOut)
  chartInstance?.off('globalout', handleChartGlobalOut)
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<template>
  <div class="graph-shell">
    <ui-empty v-if="!hasGraphData" description="暂无知识图谱数据" class="graph-empty" />
    <div v-else ref="chartRef" class="graph-canvas" aria-label="C语言程序设计知识图谱"></div>
  </div>
</template>

<style scoped>
.graph-shell {
  width: 100%;
  min-width: 0;
  min-height: 520px;
}

.graph-canvas {
  width: 100%;
  height: 540px;
  min-height: 420px;
}

.graph-empty {
  min-height: 420px;
}

@media (max-width: 960px) {
  .graph-shell {
    min-height: 420px;
  }

  .graph-canvas {
    height: 430px;
  }
}

@media (max-width: 560px) {
  .graph-canvas {
    height: 380px;
  }
}
</style>
