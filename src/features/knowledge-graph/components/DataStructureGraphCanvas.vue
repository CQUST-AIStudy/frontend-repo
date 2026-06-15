<script setup>
import * as echarts from 'echarts'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getNodeTypeMeta, getRelationTypeMeta } from '../graphDatabaseAdapter'

const props = defineProps({
  nodes: {
    type: Array,
    default: () => []
  },
  relations: {
    type: Array,
    default: () => []
  },
  selectedNodeId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['select-node'])

const chartRef = ref(null)
let chartInstance = null

const hasGraphData = computed(() => props.nodes.length > 0)

function wrapLabel(label) {
  const text = String(label || '')
  if (text.length <= 5) return text
  if (text.length <= 10) return `${text.slice(0, 5)}\n${text.slice(5)}`
  return `${text.slice(0, 5)}\n${text.slice(5, 10)}`
}

function buildChartNodes() {
  return props.nodes.map((node, index) => {
    const meta = getNodeTypeMeta(node.type)
    const selected = node.id === props.selectedNodeId
    return {
      id: node.id,
      name: node.label,
      category: node.type,
      value: node.summary,
      cursor: 'pointer',
      symbolSize: node.type === 'course' ? 86 : node.type === 'chapter' ? 62 : node.type === 'exercise' ? 36 : 44,
      x: node.x,
      y: node.y,
      itemStyle: {
        color: meta.color,
        borderColor: selected ? '#111827' : '#fff',
        borderWidth: selected ? 5 : 2,
        shadowBlur: selected ? 22 : 10,
        shadowColor: `${meta.color}44`
      },
      label: {
        show: true,
        formatter: wrapLabel(node.label),
        color: node.type === 'course' ? '#fff' : meta.textColor,
        fontSize: node.type === 'course' ? 15 : node.type === 'chapter' ? 13 : 11,
        fontWeight: node.type === 'course' || node.type === 'chapter' ? 850 : 700,
        lineHeight: 15
      },
      originalNode: node,
      itemIndex: index
    }
  })
}

function buildChartLinks() {
  return props.relations.map((relation) => {
    const meta = getRelationTypeMeta(relation.type)
    return {
      id: relation.id,
      source: relation.source,
      target: relation.target,
      value: meta.label,
      lineStyle: {
        color: meta.color,
        width: relation.type === 'CONTAINS' ? 1.4 : 1,
        opacity: relation.type === 'CONTAINS' ? 0.42 : 0.55,
        curveness: relation.type === 'RELATED_TO' ? 0.22 : 0.08
      },
      label: {
        show: false
      },
      originalRelation: relation
    }
  })
}

function handleChartClick(params) {
  if (params.dataType !== 'node') return
  emit('select-node', params.data.originalNode)
}

function renderChart() {
  if (!chartInstance || !hasGraphData.value) return
  chartInstance.setOption({
    animationDuration: 650,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.94)',
      borderWidth: 0,
      textStyle: { color: '#fff' },
      formatter(params) {
        if (params.dataType === 'edge') {
          const relation = params.data.originalRelation
          const meta = getRelationTypeMeta(relation.type)
          return `${meta.label}<br/>${relation.source} → ${relation.target}`
        }
        const node = params.data.originalNode
        const meta = getNodeTypeMeta(node.type)
        return [
          `<strong>${node.label}</strong>`,
          `类型：${meta.label}`,
          node.summary || ''
        ].filter(Boolean).join('<br/>')
      }
    },
    legend: {
      top: 6,
      left: 12,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: '#475569',
        fontSize: 12,
        fontWeight: 700
      }
    },
    series: [{
      type: 'graph',
      layout: 'force',
      roam: true,
      draggable: true,
      scaleLimit: { min: 0.45, max: 2.4 },
      categories: Object.entries({
        course: '课程',
        chapter: '章节',
        concept: '概念',
        structure: '结构',
        algorithm: '算法',
        operation: '操作',
        exercise: '练习'
      }).map(([name, label]) => ({ name, label })),
      data: buildChartNodes(),
      links: buildChartLinks(),
      edgeSymbol: ['none', 'arrow'],
      edgeSymbolSize: 6,
      force: {
        repulsion: 560,
        edgeLength: [80, 170],
        gravity: 0.08,
        friction: 0.34
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: {
          width: 2.6,
          opacity: 0.9
        }
      }
    }]
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
  renderChart()
  setTimeout(resizeChart, 100)
}

watch(
  () => [props.nodes, props.relations, props.selectedNodeId],
  () => {
    if (!chartInstance && hasGraphData.value) {
      initChart()
      return
    }
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
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<template>
  <div class="graph-canvas-shell">
    <ui-empty v-if="!hasGraphData" description="暂无知识图谱数据" class="graph-empty" />
    <div v-else ref="chartRef" class="graph-canvas" aria-label="数据结构知识图谱"></div>
  </div>
</template>

<style scoped>
.graph-canvas-shell {
  min-width: 0;
  min-height: 640px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.graph-canvas {
  width: 100%;
  height: 680px;
  min-height: 560px;
}

.graph-empty {
  min-height: 520px;
}

@media (max-width: 960px) {
  .graph-canvas-shell {
    min-height: 520px;
  }

  .graph-canvas {
    height: 560px;
  }
}

@media (max-width: 560px) {
  .graph-canvas {
    height: 460px;
    min-height: 420px;
  }
}
</style>
