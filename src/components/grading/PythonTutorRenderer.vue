<template>
  <div ref="container" class="w-full overflow-hidden rounded-lg border border-[#dce3ec] bg-[#fbfcfe]"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  state: { type: Object, default: () => ({}) },
  height: { type: Number, default: 240 }
})

const container = ref(null)
let svg = null
let simulation = null

function render() {
  if (!container.value) return
  const width = container.value.clientWidth || 600
  const height = props.height

  d3.select(container.value).selectAll('*').remove()
  if (simulation) {
    simulation.stop()
    simulation = null
  }

  svg = d3.select(container.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('display', 'block')

  const structure = props.state?.dataStructure || 'code'
  const nodes = normalizeNodes(props.state?.nodes)
  const edges = normalizeEdges(props.state?.edges)

  switch (structure) {
    case 'array':
      renderArray(svg, nodes, width, height)
      break
    case 'linked-list':
      renderLinkedList(svg, nodes, edges, width, height)
      break
    case 'tree':
      renderTree(svg, nodes, edges, width, height)
      break
    case 'graph':
      renderGraph(svg, nodes, edges, width, height)
      break
    case 'pointer':
      renderPointer(svg, nodes, edges, width, height)
      break
    case 'loop':
      renderLoop(svg, nodes, width, height)
      break
    case 'heap':
      renderHeap(svg, nodes, width, height)
      break
    default:
      renderEmpty(svg, width, height)
  }
}

function normalizeNodes(raw) {
  if (!Array.isArray(raw)) return []
  return raw.map((n, i) => ({
    id: String(n.id ?? i),
    label: String(n.label ?? ''),
    value: String(n.value ?? ''),
    active: Boolean(n.active),
    outOfBounds: Boolean(n.outOfBounds),
    index: Number(n.index ?? i)
  }))
}

function normalizeEdges(raw) {
  if (!Array.isArray(raw)) return []
  return raw.map(e => ({
    source: String(e.from ?? e.source ?? ''),
    target: String(e.to ?? e.target ?? ''),
    label: String(e.label ?? '')
  }))
}

function renderArray(svg, nodes, width, height) {
  const margin = { top: 40, left: 24 }
  const cellW = Math.min(80, (width - margin.left * 2) / Math.max(nodes.length, 1))
  const cellH = 64
  const startX = margin.left
  const startY = (height - cellH) / 2

  const g = svg.append('g')

  nodes.forEach((node, i) => {
    const x = startX + i * cellW
    const y = startY
    const color = node.outOfBounds ? '#ef4444' : node.active ? 'var(--app-primary)' : '#cbd5e1'
    const bg = node.outOfBounds ? '#fff1f2' : node.active ? 'var(--app-primary-soft)' : '#ffffff'
    const textColor = node.outOfBounds ? '#dc2626' : node.active ? 'var(--app-primary)' : '#334155'

    g.append('rect')
      .attr('x', x)
      .attr('y', y)
      .attr('width', cellW - 4)
      .attr('height', cellH)
      .attr('rx', 6)
      .attr('fill', bg)
      .attr('stroke', color)
      .attr('stroke-width', node.outOfBounds ? 2 : 1.5)
      .attr('stroke-dasharray', node.outOfBounds ? '6 4' : null)

    g.append('text')
      .attr('x', x + (cellW - 4) / 2)
      .attr('y', y - 8)
      .attr('text-anchor', 'middle')
      .attr('font-size', 11)
      .attr('fill', '#64748b')
      .text(node.label)

    g.append('text')
      .attr('x', x + (cellW - 4) / 2)
      .attr('y', y + cellH / 2 + 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', 14)
      .attr('font-weight', 600)
      .attr('fill', textColor)
      .text(truncate(node.value, 8))
  })
}

function renderLinkedList(svg, nodes, edges, width, height) {
  const nodeW = 80
  const nodeH = 48
  const gap = 60
  const totalW = nodes.length * nodeW + (nodes.length - 1) * gap
  const startX = (width - totalW) / 2
  const startY = (height - nodeH) / 2

  const g = svg.append('g')

  nodes.forEach((node, i) => {
    const x = startX + i * (nodeW + gap)
    const y = startY
    const color = node.active ? 'var(--app-primary)' : '#cbd5e1'
    const bg = node.active ? 'var(--app-primary-soft)' : '#ffffff'

    g.append('rect')
      .attr('x', x)
      .attr('y', y)
      .attr('width', nodeW)
      .attr('height', nodeH)
      .attr('rx', 6)
      .attr('fill', bg)
      .attr('stroke', color)
      .attr('stroke-width', 2)

    g.append('text')
      .attr('x', x + nodeW / 2)
      .attr('y', y + nodeH / 2 + 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13)
      .attr('font-weight', 600)
      .attr('fill', node.active ? 'var(--app-primary)' : '#334155')
      .text(truncate(node.label || node.value, 8))

    if (i < nodes.length - 1) {
      const x1 = x + nodeW
      const x2 = x + nodeW + gap
      const cy = y + nodeH / 2
      g.append('line')
        .attr('x1', x1)
        .attr('y1', cy)
        .attr('x2', x2 - 8)
        .attr('y2', cy)
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrow)')
    }
  })

  addArrowMarker(svg)
}

function renderTree(svg, nodes, edges, width, height) {
  const nodeMap = new Map(nodes.map(n => [n.id, { ...n, children: [] }]))
  const childrenSet = new Set(edges.map(e => e.target))
  const rootId = nodes.find(n => !childrenSet.has(n.id))?.id
  if (!rootId || nodes.length < 2) {
    renderFallbackGraph(svg, nodes, edges, width, height)
    return
  }

  edges.forEach(e => {
    const parent = nodeMap.get(e.source)
    const child = nodeMap.get(e.target)
    if (parent && child) parent.children.push(child)
  })

  const root = d3.hierarchy(nodeMap.get(rootId))
  const treeLayout = d3.tree().size([width - 48, height - 80])
  treeLayout(root)

  const g = svg.append('g').attr('transform', 'translate(24,40)')

  g.selectAll('path.link')
    .data(root.links())
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('d', d3.linkVertical().x(d => d.x).y(d => d.y))
    .attr('fill', 'none')
    .attr('stroke', '#cbd5e1')
    .attr('stroke-width', 2)

  const nodeG = g.selectAll('g.node')
    .data(root.descendants())
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x},${d.y})`)

  nodeG.append('circle')
    .attr('r', 22)
    .attr('fill', d => d.data.active ? 'var(--app-primary-soft)' : '#ffffff')
    .attr('stroke', d => d.data.active ? 'var(--app-primary)' : '#cbd5e1')
    .attr('stroke-width', 2)

  nodeG.append('text')
    .attr('dy', 5)
    .attr('text-anchor', 'middle')
    .attr('font-size', 12)
    .attr('font-weight', 600)
    .attr('fill', d => d.data.active ? 'var(--app-primary)' : '#334155')
    .text(d => truncate(d.data.label || d.data.value, 6))
}

function renderGraph(svg, nodes, edges, width, height) {
  const nodeById = new Map(nodes.map(n => [n.id, n]))
  const links = edges
    .map(e => ({ source: nodeById.get(e.source), target: nodeById.get(e.target), label: e.label }))
    .filter(l => l.source && l.target)

  const radius = 24
  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(90))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collide', d3.forceCollide(radius + 8))

  const g = svg.append('g')

  const link = g.selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke', '#94a3b8')
    .attr('stroke-width', 2)
    .attr('marker-end', 'url(#arrow)')

  const linkLabel = g.selectAll('text.link-label')
    .data(links.filter(l => l.label))
    .enter()
    .append('text')
    .attr('font-size', 10)
    .attr('fill', '#64748b')
    .attr('text-anchor', 'middle')
    .text(d => d.label)

  const node = g.selectAll('g.node')
    .data(nodes)
    .enter()
    .append('g')
    .call(d3.drag()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      }))

  node.append('circle')
    .attr('r', radius)
    .attr('fill', d => d.active ? 'var(--app-primary-soft)' : '#ffffff')
    .attr('stroke', d => d.active ? 'var(--app-primary)' : '#cbd5e1')
    .attr('stroke-width', 2)

  node.append('text')
    .attr('dy', 5)
    .attr('text-anchor', 'middle')
    .attr('font-size', 12)
    .attr('font-weight', 600)
    .attr('fill', d => d.active ? 'var(--app-primary)' : '#334155')
    .text(d => truncate(d.label || d.value, 5))

  simulation.on('tick', () => {
    link
      .attr('x1', d => bound(d.source.x, radius, width - radius))
      .attr('y1', d => bound(d.source.y, radius, height - radius))
      .attr('x2', d => bound(d.target.x, radius, width - radius))
      .attr('y2', d => bound(d.target.y, radius, height - radius))

    linkLabel
      .attr('x', d => (bound(d.source.x, radius, width - radius) + bound(d.target.x, radius, width - radius)) / 2)
      .attr('y', d => (bound(d.source.y, radius, height - radius) + bound(d.target.y, radius, height - radius)) / 2 - 6)

    node.attr('transform', d => `translate(${bound(d.x, radius, width - radius)},${bound(d.y, radius, height - radius)})`)
  })

  addArrowMarker(svg)
}

function renderFallbackGraph(svg, nodes, edges, width, height) {
  renderGraph(svg, nodes, edges, width, height)
}

function renderPointer(svg, nodes, edges, width, height) {
  const margin = 40
  const boxW = 100
  const boxH = 56
  const startX = (width - boxW * 2 - margin) / 2
  const startY = (height - boxH) / 2

  const g = svg.append('g')

  const pointerNode = nodes.find(n => n.label?.toLowerCase().includes('ptr') || n.id === 'ptr') || nodes[0]
  const targetNode = nodes.find(n => n.id !== pointerNode?.id) || null

  if (pointerNode) {
    g.append('rect')
      .attr('x', startX)
      .attr('y', startY)
      .attr('width', boxW)
      .attr('height', boxH)
      .attr('rx', 6)
      .attr('fill', pointerNode.active ? 'var(--app-primary-soft)' : '#ffffff')
      .attr('stroke', pointerNode.active ? 'var(--app-primary)' : '#cbd5e1')
      .attr('stroke-width', 2)

    g.append('text')
      .attr('x', startX + boxW / 2)
      .attr('y', startY + boxH / 2 + 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13)
      .attr('font-weight', 600)
      .attr('fill', pointerNode.active ? 'var(--app-primary)' : '#334155')
      .text(truncate(pointerNode.label, 10))
  }

  if (targetNode) {
    g.append('rect')
      .attr('x', startX + boxW + margin)
      .attr('y', startY)
      .attr('width', boxW)
      .attr('height', boxH)
      .attr('rx', 6)
      .attr('fill', targetNode.active ? '#fff1f2' : '#ffffff')
      .attr('stroke', targetNode.active ? '#ef4444' : '#cbd5e1')
      .attr('stroke-width', 2)

    g.append('text')
      .attr('x', startX + boxW + margin + boxW / 2)
      .attr('y', startY + boxH / 2 + 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13)
      .attr('font-weight', 600)
      .attr('fill', targetNode.active ? '#dc2626' : '#334155')
      .text(truncate(targetNode.label, 10))

    g.append('line')
      .attr('x1', startX + boxW)
      .attr('y1', startY + boxH / 2)
      .attr('x2', startX + boxW + margin - 8)
      .attr('y2', startY + boxH / 2)
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrow)')

    addArrowMarker(svg)
  }
}

function renderLoop(svg, nodes, width, height) {
  const cx = width / 2
  const cy = height / 2
  const r = Math.min(width, height) / 3
  const g = svg.append('g')

  g.append('circle')
    .attr('cx', cx)
    .attr('cy', cy)
    .attr('r', r)
    .attr('fill', 'none')
    .attr('stroke', '#ef4444')
    .attr('stroke-width', 3)
    .attr('stroke-dasharray', '8 4')

  const arrowPath = d3.arc()
    .innerRadius(r)
    .outerRadius(r)
    .startAngle(0)
    .endAngle(Math.PI * 1.5)

  g.append('path')
    .attr('d', arrowPath)
    .attr('transform', `translate(${cx},${cy})`)
    .attr('fill', 'none')
    .attr('stroke', '#ef4444')
    .attr('stroke-width', 3)
    .attr('marker-end', 'url(#arrow)')

  const label = nodes[0]?.value || '循环条件'
  g.append('text')
    .attr('x', cx)
    .attr('y', cy + 5)
    .attr('text-anchor', 'middle')
    .attr('font-size', 14)
    .attr('font-weight', 600)
    .attr('fill', '#dc2626')
    .text(truncate(label, 20))

  addArrowMarker(svg)
}

function renderHeap(svg, nodes, width, height) {
  const blockW = 100
  const blockH = 56
  const gap = 16
  const startX = (width - (nodes.length * blockW + (nodes.length - 1) * gap)) / 2
  const startY = (height - blockH) / 2
  const g = svg.append('g')

  nodes.forEach((node, i) => {
    const x = startX + i * (blockW + gap)
    const y = startY
    const leaked = node.value?.includes('未释放')
    g.append('rect')
      .attr('x', x)
      .attr('y', y)
      .attr('width', blockW)
      .attr('height', blockH)
      .attr('rx', 6)
      .attr('fill', leaked ? '#fff1f2' : '#f3fbf5')
      .attr('stroke', leaked ? '#ef4444' : '#22c55e')
      .attr('stroke-width', 2)

    g.append('text')
      .attr('x', x + blockW / 2)
      .attr('y', y + blockH / 2 + 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13)
      .attr('font-weight', 600)
      .attr('fill', leaked ? '#dc2626' : '#166534')
      .text(truncate(node.label, 10))
  })
}

function renderEmpty(svg, width, height) {
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', height / 2)
    .attr('text-anchor', 'middle')
    .attr('font-size', 14)
    .attr('fill', '#94a3b8')
    .text('当前步骤无可视化状态')
}

function addArrowMarker(svg) {
  svg.append('defs')
    .append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 8)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#94a3b8')
}

function bound(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function truncate(text, max) {
  const s = String(text ?? '')
  return s.length > max ? s.slice(0, max) + '…' : s
}

onMounted(render)
watch(() => [props.state, props.height], render, { deep: true })
onBeforeUnmount(() => {
  if (simulation) simulation.stop()
  d3.select(container.value).selectAll('*').remove()
})
</script>
