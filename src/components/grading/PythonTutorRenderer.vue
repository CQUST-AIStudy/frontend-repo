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

// 结构别名归一：让大模型/上游多种叫法都能落到同一个渲染函数
const STRUCTURE_ALIASES = {
  'list': 'linked-list',
  'linkedlist': 'linked-list',
  'single-linked-list': 'linked-list',
  'singly-linked-list': 'linked-list',
  'doubly-linked-list': 'doubly-linked-list',
  'double-linked-list': 'doubly-linked-list',
  'dlist': 'doubly-linked-list',
  'circular-linked-list': 'circular-linked-list',
  'circular-list': 'circular-linked-list',
  'static-linked-list': 'static-linked-list',
  'static-list': 'static-linked-list',
  'matrix': 'matrix',
  '2d-array': 'matrix',
  'grid': 'matrix',
  'string': 'string',
  'str': 'string',
  'stack': 'stack',
  'queue': 'queue',
  'circular-queue': 'circular-queue',
  'ring-queue': 'circular-queue',
  'deque': 'queue',
  'binary-tree': 'binary-tree',
  'bst': 'binary-tree',
  'binary-search-tree': 'binary-tree',
  'huffman-tree': 'binary-tree',
  'avl': 'binary-tree',
  'tree': 'tree',
  'heap': 'heap',
  'min-heap': 'heap',
  'max-heap': 'heap',
  'graph': 'graph',
  'adjacency-matrix': 'adjacency-matrix',
  'adj-matrix': 'adjacency-matrix',
  'adjacency-list': 'adjacency-list',
  'adj-list': 'adjacency-list',
  'hash-table': 'hash-table',
  'hashtable': 'hash-table',
  'hashmap': 'hash-table',
  'pointer': 'pointer',
  'loop': 'loop',
  'code': 'code'
}

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

  const raw = props.state?.dataStructure || 'code'
  // 先查别名表；规范名（array/linked-list 等）不在别名表里，回落到原值本身，交给 switch 匹配。
  const structure = STRUCTURE_ALIASES[String(raw).toLowerCase()] || String(raw).toLowerCase()
  const nodes = normalizeNodes(props.state?.nodes)
  const edges = normalizeEdges(props.state?.edges)
  const pointers = normalizePointers(props.state?.pointers)

  switch (structure) {
    case 'array': renderArray(svg, nodes, width, height); break
    case 'matrix': renderMatrix(svg, nodes, width, height); break
    case 'string': renderString(svg, nodes, width, height); break
    case 'linked-list': renderLinkedList(svg, nodes, edges, pointers, width, height, { doubly: false, circular: false }); break
    case 'doubly-linked-list': renderLinkedList(svg, nodes, edges, pointers, width, height, { doubly: true, circular: false }); break
    case 'circular-linked-list': renderLinkedList(svg, nodes, edges, pointers, width, height, { doubly: false, circular: true }); break
    case 'static-linked-list': renderStaticLinkedList(svg, nodes, width, height); break
    case 'stack': renderStack(svg, nodes, pointers, width, height); break
    case 'queue': renderQueue(svg, nodes, pointers, width, height); break
    case 'circular-queue': renderCircularQueue(svg, nodes, pointers, width, height); break
    case 'tree': renderTree(svg, nodes, edges, width, height); break
    case 'binary-tree': renderBinaryTree(svg, nodes, edges, width, height); break
    case 'heap': renderHeap(svg, nodes, edges, width, height); break
    case 'graph': renderGraph(svg, nodes, edges, width, height); break
    case 'adjacency-matrix': renderAdjacencyMatrix(svg, nodes, edges, width, height); break
    case 'adjacency-list': renderAdjacencyList(svg, nodes, edges, width, height); break
    case 'hash-table': renderHashTable(svg, nodes, width, height); break
    case 'pointer': renderPointer(svg, nodes, edges, width, height); break
    case 'loop': renderLoop(svg, nodes, width, height); break
    case 'code': renderScalars(svg, nodes, width, height); break
    default: renderScalars(svg, nodes, width, height)
  }
}

// ---------- 归一化 ----------
function normalizeNodes(raw) {
  if (!Array.isArray(raw)) return []
  return raw.map((n, i) => ({
    id: String(n.id ?? i),
    label: String(n.label ?? ''),
    value: String(n.value ?? n.label ?? ''),
    active: Boolean(n.active),
    outOfBounds: Boolean(n.outOfBounds),
    index: Number(n.index ?? i),
    next: n.next != null ? String(n.next) : null,
    cursor: n.cursor != null ? Number(n.cursor) : null,
    row: n.row != null ? Number(n.row) : null,
    col: n.col != null ? Number(n.col) : null,
    slot: n.slot != null ? Number(n.slot) : null,
    pointer: n.pointer != null ? String(n.pointer) : null
  }))
}

function normalizeEdges(raw) {
  if (!Array.isArray(raw)) return []
  return raw.map(e => ({
    source: String(e.from ?? e.source ?? ''),
    target: String(e.to ?? e.target ?? ''),
    label: String(e.label ?? ''),
    kind: String(e.kind ?? '')
  }))
}

function normalizePointers(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.map(p => ({ name: String(p.name ?? ''), target: String(p.target ?? p.node ?? '') }))
      .filter(p => p.target)
  }
  if (typeof raw === 'object') {
    return Object.entries(raw).map(([name, target]) => ({ name: String(name), target: String(target) }))
  }
  return []
}

// ---------- 复用件 ----------
function colorsFor(node) {
  if (node.outOfBounds) return { stroke: '#ef4444', fill: '#fff1f2', text: '#dc2626', dash: '6 4' }
  if (node.active) return { stroke: 'var(--app-primary)', fill: 'var(--app-primary-soft)', text: 'var(--app-primary)', dash: null }
  return { stroke: '#cbd5e1', fill: '#ffffff', text: '#334155', dash: null }
}

function addArrowMarker(svg, id = 'arrow', color = '#94a3b8') {
  svg.append('defs')
    .append('marker')
    .attr('id', id)
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 8)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', color)
}

function drawBox(g, x, y, w, h, node, fontSize = 13) {
  const c = colorsFor(node)
  g.append('rect')
    .attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('rx', 6)
    .attr('fill', c.fill).attr('stroke', c.stroke).attr('stroke-width', 2)
    .attr('stroke-dasharray', c.dash)
  g.append('text')
    .attr('x', x + w / 2).attr('y', y + h / 2 + fontSize / 3)
    .attr('text-anchor', 'middle').attr('font-size', fontSize).attr('font-weight', 600)
    .attr('fill', c.text)
    .text(truncate(node.label || node.value, 8))
  return c
}

// 在节点上方画一个带标签的下指箭头（top/front/rear/pHead 等）
function drawPointerBadge(g, cx, topY, name, color = 'var(--app-primary)') {
  g.append('text')
    .attr('x', cx).attr('y', topY - 20).attr('text-anchor', 'middle')
    .attr('font-size', 12).attr('font-weight', 700).attr('fill', color)
    .text(name)
  g.append('line')
    .attr('x1', cx).attr('y1', topY - 15).attr('x2', cx).attr('y2', topY - 3)
    .attr('stroke', color).attr('stroke-width', 2).attr('marker-end', 'url(#arrow-primary)')
}

// ---------- 线性表 ----------
function renderArray(svg, nodes, width, height) {
  // 多个数组（如 graph[i]/visited[i]）按名字分组各占一行，裸变量归入标量行，
  // 避免把 22 个格子挤进同一行导致标签重叠
  const groups = []
  const byKey = new Map()
  for (const node of nodes) {
    const m = String(node.label || '').match(/^(.+)\[\d+\]$/)
    const key = m ? m[1] : '__scalar__'
    if (!byKey.has(key)) {
      byKey.set(key, [])
      groups.push(key)
    }
    byKey.get(key).push(node)
  }
  const cellH = 44
  const rowGap = 30
  const totalH = groups.length * (cellH + rowGap) - rowGap
  let y = Math.max(16, (height - totalH) / 2)
  const g = svg.append('g')

  for (const key of groups) {
    const arr = byKey.get(key)
    if (key === '__scalar__') {
      const cellW = Math.min(96, (width - 48) / Math.max(arr.length, 1))
      const startX = (width - cellW * arr.length) / 2
      arr.forEach((node, i) => {
        const x = startX + i * cellW
        g.append('text')
          .attr('x', x + (cellW - 6) / 2).attr('y', y - 6)
          .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#64748b')
          .text(truncate(node.label || node.id, 10))
        const c = colorsFor(node)
        g.append('rect')
          .attr('x', x).attr('y', y).attr('width', cellW - 6).attr('height', cellH - 8).attr('rx', 6)
          .attr('fill', c.fill).attr('stroke', c.stroke).attr('stroke-width', 1.5).attr('stroke-dasharray', c.dash)
        g.append('text')
          .attr('x', x + (cellW - 6) / 2).attr('y', y + (cellH - 8) / 2 + 5)
          .attr('text-anchor', 'middle').attr('font-size', 13).attr('font-weight', 600).attr('fill', c.text)
          .text(truncate(node.value, 8))
      })
    } else {
      const cellW = Math.min(64, (width - 130) / Math.max(arr.length, 1))
      const startX = 106
      g.append('text')
        .attr('x', 24).attr('y', y + cellH / 2 + 4)
        .attr('font-size', 12).attr('font-weight', 600).attr('fill', '#475569')
        .text(truncate(key, 12))
      arr.forEach((node, i) => {
        const x = startX + i * cellW
        g.append('text')
          .attr('x', x + (cellW - 4) / 2).attr('y', y - 5)
          .attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', '#94a3b8')
          .text(String(node.label || '').slice(key.length + 1, -1) || String(node.index))
        const c = colorsFor(node)
        g.append('rect')
          .attr('x', x).attr('y', y).attr('width', cellW - 4).attr('height', cellH).attr('rx', 6)
          .attr('fill', c.fill).attr('stroke', c.stroke).attr('stroke-width', node.outOfBounds ? 2 : 1.5)
          .attr('stroke-dasharray', c.dash)
        g.append('text')
          .attr('x', x + (cellW - 4) / 2).attr('y', y + cellH / 2 + 5)
          .attr('text-anchor', 'middle').attr('font-size', 13).attr('font-weight', 600).attr('fill', c.text)
          .text(truncate(node.value, 6))
      })
    }
    y += cellH + rowGap
  }
}

function renderMatrix(svg, nodes, width, height) {
  const rows = Math.max(1, (props.state?.rows) || (Math.max(...nodes.map(n => (n.row ?? 0))) + 1))
  const cols = Math.max(1, (props.state?.cols) || (Math.max(...nodes.map(n => (n.col ?? 0))) + 1))
  const cell = Math.min(56, (width - 48) / cols, (height - 48) / rows)
  const startX = (width - cell * cols) / 2
  const startY = (height - cell * rows) / 2
  const g = svg.append('g')

  nodes.forEach((node, i) => {
    const r = node.row != null ? node.row : Math.floor(i / cols)
    const col = node.col != null ? node.col : i % cols
    const x = startX + col * cell
    const y = startY + r * cell
    const c = colorsFor(node)
    g.append('rect')
      .attr('x', x).attr('y', y).attr('width', cell - 3).attr('height', cell - 3).attr('rx', 4)
      .attr('fill', c.fill).attr('stroke', c.stroke).attr('stroke-width', 1.5).attr('stroke-dasharray', c.dash)
    g.append('text')
      .attr('x', x + (cell - 3) / 2).attr('y', y + (cell - 3) / 2 + 4)
      .attr('text-anchor', 'middle').attr('font-size', 12).attr('font-weight', 600).attr('fill', c.text)
      .text(truncate(node.value, 5))
  })
}

function renderString(svg, nodes, width, height) {
  const cellW = Math.min(48, (width - 48) / Math.max(nodes.length, 1))
  const cellH = 48
  const startX = (width - cellW * nodes.length) / 2
  const startY = (height - cellH) / 2
  const g = svg.append('g')
  nodes.forEach((node, i) => {
    const x = startX + i * cellW
    const c = colorsFor(node)
    g.append('rect')
      .attr('x', x).attr('y', startY).attr('width', cellW - 2).attr('height', cellH)
      .attr('fill', c.fill).attr('stroke', c.stroke).attr('stroke-width', 1.5).attr('stroke-dasharray', c.dash)
    g.append('text')
      .attr('x', x + (cellW - 2) / 2).attr('y', startY + cellH / 2 + 5)
      .attr('text-anchor', 'middle').attr('font-size', 15).attr('font-weight', 600).attr('fill', c.text)
      .text(truncate(node.value || node.label, 3))
    g.append('text')
      .attr('x', x + (cellW - 2) / 2).attr('y', startY + cellH + 14)
      .attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', '#94a3b8')
      .text(node.index)
  })
}

// 单/双/循环链表统一渲染
function renderLinkedList(svg, nodes, edges, pointers, width, height, opts) {
  const nodeW = 82
  const nodeH = 46
  const gap = 56
  const totalW = nodes.length * nodeW + (nodes.length - 1) * gap
  const startX = Math.max(20, (width - totalW) / 2)
  const startY = (height - nodeH) / 2
  const g = svg.append('g')
  addArrowMarker(svg, 'arrow', '#94a3b8')
  addArrowMarker(svg, 'arrow-primary', '#2563eb')

  const centerOf = id => {
    const idx = nodes.findIndex(n => n.id === id || String(n.index) === id)
    if (idx < 0) return null
    return { x: startX + idx * (nodeW + gap) + nodeW / 2, top: startY }
  }

  nodes.forEach((node, i) => {
    const x = startX + i * (nodeW + gap)
    drawBox(g, x, startY, nodeW, nodeH, node)
    // next 箭头
    if (i < nodes.length - 1) {
      const cy = startY + nodeH / 2
      g.append('line')
        .attr('x1', x + nodeW).attr('y1', cy - (opts.doubly ? 8 : 0))
        .attr('x2', x + nodeW + gap - 8).attr('y2', cy - (opts.doubly ? 8 : 0))
        .attr('stroke', '#94a3b8').attr('stroke-width', 2).attr('marker-end', 'url(#arrow)')
      // 双链表 prior 反向箭头
      if (opts.doubly) {
        g.append('line')
          .attr('x1', x + nodeW + gap).attr('y1', cy + 8)
          .attr('x2', x + nodeW + 8).attr('y2', cy + 8)
          .attr('stroke', '#cbd5e1').attr('stroke-width', 2).attr('marker-end', 'url(#arrow)')
      }
    }
  })

  if (nodes.length > 0) {
    const lastX = startX + (nodes.length - 1) * (nodeW + gap)
    const cy = startY + nodeH / 2
    if (opts.circular) {
      // 末结点指回首结点：走一条上方折线
      const topY = startY - 24
      const x1 = lastX + nodeW / 2, x2 = startX + nodeW / 2
      g.append('path')
        .attr('d', `M ${x1} ${startY} V ${topY} H ${x2} V ${startY - 2}`)
        .attr('fill', 'none').attr('stroke', '#94a3b8').attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrow)')
    } else {
      // 末结点指向 NULL
      g.append('text')
        .attr('x', lastX + nodeW + gap).attr('y', cy + 5)
        .attr('text-anchor', 'middle').attr('font-size', 13).attr('font-weight', 600).attr('fill', '#94a3b8')
        .text('NULL')
      g.append('line')
        .attr('x1', lastX + nodeW).attr('y1', cy).attr('x2', lastX + nodeW + gap - 20).attr('y2', cy)
        .attr('stroke', '#94a3b8').attr('stroke-width', 2).attr('marker-end', 'url(#arrow)')
    }
  }

  // 头/尾等指针徽标
  pointers.forEach(p => {
    const c = centerOf(p.target)
    if (c) drawPointerBadge(g, c.x, c.top, p.name)
  })
}

function renderStaticLinkedList(svg, nodes, width, height) {
  // 表格：下标 | data | cur(游标)
  const cols = ['下标', 'data', 'cur']
  const rowH = 26
  const colW = Math.min(90, (width - 40) / 3)
  const tableW = colW * 3
  const startX = (width - tableW) / 2
  const startY = Math.max(10, (height - rowH * (nodes.length + 1)) / 2)
  const g = svg.append('g')

  cols.forEach((c, ci) => {
    g.append('rect').attr('x', startX + ci * colW).attr('y', startY).attr('width', colW).attr('height', rowH)
      .attr('fill', '#f1f5f9').attr('stroke', '#cbd5e1')
    g.append('text').attr('x', startX + ci * colW + colW / 2).attr('y', startY + rowH / 2 + 4)
      .attr('text-anchor', 'middle').attr('font-size', 12).attr('font-weight', 600).attr('fill', '#475569').text(c)
  })
  nodes.forEach((node, i) => {
    const y = startY + (i + 1) * rowH
    const c = colorsFor(node)
    const vals = [String(node.index), truncate(node.value, 8), node.cursor != null ? String(node.cursor) : '^']
    vals.forEach((v, ci) => {
      g.append('rect').attr('x', startX + ci * colW).attr('y', y).attr('width', colW).attr('height', rowH)
        .attr('fill', ci === 0 ? '#fbfcfe' : c.fill).attr('stroke', '#e2e8f0')
      g.append('text').attr('x', startX + ci * colW + colW / 2).attr('y', y + rowH / 2 + 4)
        .attr('text-anchor', 'middle').attr('font-size', 12).attr('font-weight', ci === 0 ? 400 : 600)
        .attr('fill', ci === 0 ? '#94a3b8' : c.text).text(v)
    })
  })
}

// ---------- 栈与队列 ----------
function renderStack(svg, nodes, pointers, width, height) {
  const boxW = 120
  const boxH = 34
  const startX = (width - boxW) / 2
  const baseY = height - 20
  const g = svg.append('g')
  addArrowMarker(svg, 'arrow-primary', '#2563eb')

  // index 0 在底部，往上堆
  nodes.forEach((node, i) => {
    const y = baseY - (i + 1) * boxH
    drawBox(g, startX, y, boxW, boxH - 2, node, 13)
  })
  // 栈底标注
  g.append('text').attr('x', startX + boxW / 2).attr('y', baseY + 14)
    .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#94a3b8').text('栈底')

  // top 指针（默认指向最上元素）
  const topName = pointers.find(p => /top|栈顶/i.test(p.name))?.name || 'top'
  if (nodes.length > 0) {
    const topY = baseY - nodes.length * boxH
    g.append('text').attr('x', startX + boxW + 12).attr('y', topY + boxH / 2)
      .attr('font-size', 12).attr('font-weight', 700).attr('fill', 'var(--app-primary)').text('← ' + topName)
  }
}

function renderQueue(svg, nodes, pointers, width, height) {
  const boxW = Math.min(72, (width - 60) / Math.max(nodes.length, 1))
  const boxH = 46
  const startX = Math.max(20, (width - boxW * nodes.length) / 2)
  const startY = (height - boxH) / 2
  const g = svg.append('g')
  addArrowMarker(svg, 'arrow-primary', '#2563eb')

  nodes.forEach((node, i) => {
    drawBox(g, startX + i * boxW, startY, boxW - 2, boxH, node)
  })
  const findIdx = re => {
    const p = pointers.find(pp => re.test(pp.name))
    if (!p) return -1
    return nodes.findIndex(n => n.id === p.target || String(n.index) === p.target)
  }
  let fi = findIdx(/front|队头/i); if (fi < 0 && nodes.length) fi = 0
  let ri = findIdx(/rear|队尾/i); if (ri < 0 && nodes.length) ri = nodes.length - 1
  if (fi >= 0) drawPointerBadge(g, startX + fi * boxW + boxW / 2, startY, 'front')
  if (ri >= 0) {
    g.append('text').attr('x', startX + ri * boxW + boxW / 2).attr('y', startY + boxH + 18)
      .attr('text-anchor', 'middle').attr('font-size', 12).attr('font-weight', 700)
      .attr('fill', '#0f766e').text('rear')
  }
}

function renderCircularQueue(svg, nodes, pointers, width, height) {
  const cap = props.state?.capacity || nodes.length
  const cx = width / 2
  const cy = height / 2
  const R = Math.min(width, height) / 2 - 40
  const r = 20
  const g = svg.append('g')

  const findIdx = re => {
    const p = pointers.find(pp => re.test(pp.name))
    if (!p) return -1
    return nodes.findIndex(n => n.id === p.target || String(n.index) === p.target)
  }
  const frontI = findIdx(/front|队头/i)
  const rearI = findIdx(/rear|队尾/i)

  for (let i = 0; i < cap; i++) {
    const node = nodes[i] || { index: i, value: '', label: '', active: false, outOfBounds: false }
    const ang = (i / cap) * Math.PI * 2 - Math.PI / 2
    const x = cx + R * Math.cos(ang)
    const y = cy + R * Math.sin(ang)
    const c = colorsFor(node)
    g.append('circle').attr('cx', x).attr('cy', y).attr('r', r)
      .attr('fill', c.fill).attr('stroke', c.stroke).attr('stroke-width', 2)
    g.append('text').attr('x', x).attr('y', y + 4).attr('text-anchor', 'middle')
      .attr('font-size', 12).attr('font-weight', 600).attr('fill', c.text).text(truncate(node.value, 4))
    g.append('text').attr('x', cx + (R + 16) * Math.cos(ang)).attr('y', cy + (R + 16) * Math.sin(ang) + 3)
      .attr('text-anchor', 'middle').attr('font-size', 9).attr('fill', '#94a3b8').text(i)
    if (i === frontI) labelRing(g, cx, cy, R - 34, ang, 'front', 'var(--app-primary)')
    if (i === rearI) labelRing(g, cx, cy, R - 34, ang, 'rear', '#0f766e')
  }
}

function labelRing(g, cx, cy, rr, ang, text, color) {
  g.append('text')
    .attr('x', cx + rr * Math.cos(ang)).attr('y', cy + rr * Math.sin(ang) + 3)
    .attr('text-anchor', 'middle').attr('font-size', 11).attr('font-weight', 700).attr('fill', color).text(text)
}

// ---------- 树 ----------
function renderTree(svg, nodes, edges, width, height) {
  const nodeMap = new Map(nodes.map(n => [n.id, { ...n, children: [] }]))
  const childrenSet = new Set(edges.map(e => e.target))
  const rootId = nodes.find(n => !childrenSet.has(n.id))?.id
  if (!rootId || nodes.length < 2) { renderGraph(svg, nodes, edges, width, height); return }
  edges.forEach(e => {
    const parent = nodeMap.get(e.source)
    const child = nodeMap.get(e.target)
    if (parent && child) parent.children.push(child)
  })
  const root = d3.hierarchy(nodeMap.get(rootId))
  d3.tree().size([width - 48, height - 80])(root)
  const g = svg.append('g').attr('transform', 'translate(24,40)')
  g.selectAll('path.link').data(root.links()).enter().append('path')
    .attr('d', d3.linkVertical().x(d => d.x).y(d => d.y))
    .attr('fill', 'none').attr('stroke', '#cbd5e1').attr('stroke-width', 2)
  const nodeG = g.selectAll('g.node').data(root.descendants()).enter().append('g')
    .attr('transform', d => `translate(${d.x},${d.y})`)
  nodeG.append('circle').attr('r', 20)
    .attr('fill', d => colorsFor(d.data).fill).attr('stroke', d => colorsFor(d.data).stroke).attr('stroke-width', 2)
  nodeG.append('text').attr('dy', 5).attr('text-anchor', 'middle').attr('font-size', 12).attr('font-weight', 600)
    .attr('fill', d => colorsFor(d.data).text).text(d => truncate(d.data.label || d.data.value, 6))
}

// 二叉树 / BST：用 edges 的 kind(child-left/child-right) 或 label(L/R) 定左右
function renderBinaryTree(svg, nodes, edges, width, height) {
  if (nodes.length === 0) { renderEmpty(svg, width, height); return }
  const byId = new Map(nodes.map(n => [n.id, n]))
  const left = new Map(), right = new Map()
  const childSet = new Set()
  edges.forEach(e => {
    const k = (e.kind || '').toLowerCase()
    const lb = (e.label || '').toLowerCase()
    const isLeft = k.includes('left') || lb === 'l' || lb === '左' || lb.includes('left')
    const isRight = k.includes('right') || lb === 'r' || lb === '右' || lb.includes('right')
    if (isLeft) left.set(e.source, e.target)
    else if (isRight) right.set(e.source, e.target)
    else { (left.has(e.source) ? right : left).set(e.source, e.target) }
    childSet.add(e.target)
  })
  const rootId = nodes.find(n => !childSet.has(n.id))?.id || nodes[0].id

  const depth = new Map()
  const pos = new Map()
  let counter = 0
  const assign = (id, d) => {
    if (id == null || !byId.has(id) || pos.has(id)) return
    depth.set(id, d)
    if (left.get(id)) assign(left.get(id), d + 1)
    pos.set(id, counter++)          // 中序遍历定 x 序
    if (right.get(id)) assign(right.get(id), d + 1)
  }
  assign(rootId, 0)
  const maxDepth = Math.max(0, ...[...depth.values()])
  const stepX = (width - 60) / Math.max(counter, 1)
  const stepY = (height - 70) / Math.max(maxDepth, 1)
  const g = svg.append('g').attr('transform', 'translate(30,36)')
  const xy = id => ({ x: pos.get(id) * stepX, y: depth.get(id) * stepY })

  // 边
  edges.forEach(e => {
    if (!pos.has(e.source) || !pos.has(e.target)) return
    const a = xy(e.source), b = xy(e.target)
    g.append('line').attr('x1', a.x).attr('y1', a.y).attr('x2', b.x).attr('y2', b.y)
      .attr('stroke', '#cbd5e1').attr('stroke-width', 2)
  })
  // 结点
  nodes.forEach(n => {
    if (!pos.has(n.id)) return
    const p = xy(n.id), c = colorsFor(n)
    g.append('circle').attr('cx', p.x).attr('cy', p.y).attr('r', 19)
      .attr('fill', c.fill).attr('stroke', c.stroke).attr('stroke-width', 2)
    g.append('text').attr('x', p.x).attr('y', p.y + 5).attr('text-anchor', 'middle')
      .attr('font-size', 12).attr('font-weight', 600).attr('fill', c.text).text(truncate(n.label || n.value, 5))
  })
}

// 堆：默认按数组下标当完全二叉树布局（index 1 起或 0 起皆可）
function renderHeap(svg, nodes, edges, width, height) {
  if (nodes.length === 0) { renderEmpty(svg, width, height); return }
  const oneBased = nodes.every(n => n.index >= 1) && nodes.some(n => n.index === 1)
  const idxOf = n => oneBased ? n.index : n.index + 1  // 归一到 1 起
  const maxIdx = Math.max(...nodes.map(idxOf))
  const levels = Math.floor(Math.log2(maxIdx)) + 1
  const stepY = (height - 60) / Math.max(levels - 1, 1)
  const g = svg.append('g').attr('transform', 'translate(0,32)')
  const posOf = i => {
    const level = Math.floor(Math.log2(i))
    const first = Math.pow(2, level)
    const countInLevel = Math.pow(2, level)
    const posInLevel = i - first
    const slotW = width / (countInLevel + 1)
    return { x: slotW * (posInLevel + 1), y: level * stepY }
  }
  // 边（父 i → 子 2i / 2i+1）
  nodes.forEach(n => {
    const i = idxOf(n)
    ;[2 * i, 2 * i + 1].forEach(ci => {
      if (nodes.some(m => idxOf(m) === ci)) {
        const a = posOf(i), b = posOf(ci)
        g.append('line').attr('x1', a.x).attr('y1', a.y).attr('x2', b.x).attr('y2', b.y)
          .attr('stroke', '#cbd5e1').attr('stroke-width', 2)
      }
    })
  })
  nodes.forEach(n => {
    const p = posOf(idxOf(n)), c = colorsFor(n)
    g.append('circle').attr('cx', p.x).attr('cy', p.y).attr('r', 18)
      .attr('fill', c.fill).attr('stroke', c.stroke).attr('stroke-width', 2)
    g.append('text').attr('x', p.x).attr('y', p.y + 5).attr('text-anchor', 'middle')
      .attr('font-size', 12).attr('font-weight', 600).attr('fill', c.text).text(truncate(n.value || n.label, 4))
  })
}

// ---------- 图 / 散列 ----------
function renderGraph(svg, nodes, edges, width, height) {
  const nodeById = new Map(nodes.map(n => [n.id, n]))
  const links = edges
    .map(e => ({ source: nodeById.get(e.source), target: nodeById.get(e.target), label: e.label }))
    .filter(l => l.source && l.target)
  const radius = 22
  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(90))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collide', d3.forceCollide(radius + 8))
  const g = svg.append('g')
  const link = g.selectAll('line').data(links).enter().append('line')
    .attr('stroke', '#94a3b8').attr('stroke-width', 2).attr('marker-end', 'url(#arrow)')
  const linkLabel = g.selectAll('text.ll').data(links.filter(l => l.label)).enter().append('text')
    .attr('font-size', 10).attr('fill', '#64748b').attr('text-anchor', 'middle').text(d => d.label)
  const node = g.selectAll('g.node').data(nodes).enter().append('g')
    .call(d3.drag()
      .on('start', (ev, d) => { if (!ev.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
      .on('drag', (ev, d) => { d.fx = ev.x; d.fy = ev.y })
      .on('end', (ev, d) => { if (!ev.active) simulation.alphaTarget(0); d.fx = null; d.fy = null }))
  node.append('circle').attr('r', radius)
    .attr('fill', d => colorsFor(d).fill).attr('stroke', d => colorsFor(d).stroke).attr('stroke-width', 2)
  node.append('text').attr('dy', 5).attr('text-anchor', 'middle').attr('font-size', 12).attr('font-weight', 600)
    .attr('fill', d => colorsFor(d).text).text(d => truncate(d.label || d.value, 5))
  simulation.on('tick', () => {
    link.attr('x1', d => bound(d.source.x, radius, width - radius)).attr('y1', d => bound(d.source.y, radius, height - radius))
      .attr('x2', d => bound(d.target.x, radius, width - radius)).attr('y2', d => bound(d.target.y, radius, height - radius))
    linkLabel.attr('x', d => (bound(d.source.x, radius, width - radius) + bound(d.target.x, radius, width - radius)) / 2)
      .attr('y', d => (bound(d.source.y, radius, height - radius) + bound(d.target.y, radius, height - radius)) / 2 - 6)
    node.attr('transform', d => `translate(${bound(d.x, radius, width - radius)},${bound(d.y, radius, height - radius)})`)
  })
  addArrowMarker(svg)
}

function renderAdjacencyMatrix(svg, nodes, edges, width, height) {
  const n = nodes.length
  if (n === 0) { renderEmpty(svg, width, height); return }
  const idOrder = nodes.map(x => x.id)
  const idx = new Map(idOrder.map((id, i) => [id, i]))
  const cell = Math.min(44, (width - 60) / (n + 1), (height - 60) / (n + 1))
  const startX = (width - cell * (n + 1)) / 2 + cell
  const startY = (height - cell * (n + 1)) / 2 + cell
  const g = svg.append('g')
  const label = i => truncate(nodes[i].label || nodes[i].value || String(i), 3)
  // 表头
  for (let i = 0; i < n; i++) {
    g.append('text').attr('x', startX + i * cell + cell / 2).attr('y', startY - cell / 2 + 4)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('font-weight', 600).attr('fill', '#475569').text(label(i))
    g.append('text').attr('x', startX - cell / 2).attr('y', startY + i * cell + cell / 2 + 4)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('font-weight', 600).attr('fill', '#475569').text(label(i))
  }
  const adj = Array.from({ length: n }, () => Array(n).fill(0))
  edges.forEach(e => { const a = idx.get(e.source), b = idx.get(e.target); if (a != null && b != null) adj[a][b] = 1 })
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x = startX + j * cell, y = startY + i * cell
    g.append('rect').attr('x', x).attr('y', y).attr('width', cell - 2).attr('height', cell - 2)
      .attr('fill', adj[i][j] ? 'var(--app-primary-soft)' : '#ffffff').attr('stroke', '#e2e8f0')
    g.append('text').attr('x', x + (cell - 2) / 2).attr('y', y + (cell - 2) / 2 + 4).attr('text-anchor', 'middle')
      .attr('font-size', 11).attr('font-weight', 600).attr('fill', adj[i][j] ? 'var(--app-primary)' : '#cbd5e1').text(adj[i][j])
  }
}

function renderAdjacencyList(svg, nodes, edges, width, height) {
  const rowH = Math.min(40, (height - 20) / Math.max(nodes.length, 1))
  const startX = 24
  const startY = (height - rowH * nodes.length) / 2
  const headW = 60
  const g = svg.append('g')
  addArrowMarker(svg, 'arrow', '#94a3b8')
  const labelOf = id => { const n = nodes.find(x => x.id === id); return n ? truncate(n.label || n.value, 4) : id }
  nodes.forEach((node, i) => {
    const y = startY + i * rowH
    const c = colorsFor(node)
    g.append('rect').attr('x', startX).attr('y', y).attr('width', headW).attr('height', rowH - 6).attr('rx', 4)
      .attr('fill', c.fill).attr('stroke', c.stroke).attr('stroke-width', 1.5)
    g.append('text').attr('x', startX + headW / 2).attr('y', y + (rowH - 6) / 2 + 4).attr('text-anchor', 'middle')
      .attr('font-size', 12).attr('font-weight', 600).attr('fill', c.text).text(truncate(node.label || node.value, 4))
    const neighbors = edges.filter(e => e.source === node.id).map(e => labelOf(e.target))
    let x = startX + headW + 24
    neighbors.forEach(nb => {
      g.append('line').attr('x1', x - 22).attr('y1', y + (rowH - 6) / 2).attr('x2', x - 4).attr('y2', y + (rowH - 6) / 2)
        .attr('stroke', '#94a3b8').attr('stroke-width', 1.5).attr('marker-end', 'url(#arrow)')
      g.append('rect').attr('x', x).attr('y', y).attr('width', 42).attr('height', rowH - 6).attr('rx', 4)
        .attr('fill', '#ffffff').attr('stroke', '#cbd5e1')
      g.append('text').attr('x', x + 21).attr('y', y + (rowH - 6) / 2 + 4).attr('text-anchor', 'middle')
        .attr('font-size', 11).attr('font-weight', 600).attr('fill', '#334155').text(nb)
      x += 66
    })
  })
}

function renderHashTable(svg, nodes, width, height) {
  const buckets = props.state?.buckets || (Math.max(0, ...nodes.map(n => n.slot ?? 0)) + 1)
  const rowH = Math.min(34, (height - 16) / Math.max(buckets, 1))
  const startX = 24
  const startY = (height - rowH * buckets) / 2
  const headW = 44
  const g = svg.append('g')
  addArrowMarker(svg, 'arrow', '#94a3b8')
  for (let b = 0; b < buckets; b++) {
    const y = startY + b * rowH
    g.append('rect').attr('x', startX).attr('y', y).attr('width', headW).attr('height', rowH - 5)
      .attr('fill', '#f1f5f9').attr('stroke', '#cbd5e1')
    g.append('text').attr('x', startX + headW / 2).attr('y', y + (rowH - 5) / 2 + 4).attr('text-anchor', 'middle')
      .attr('font-size', 11).attr('font-weight', 600).attr('fill', '#475569').text(b)
    // 该桶内的链（同 slot 的 node 依 index 排）
    const chain = nodes.filter(n => (n.slot ?? 0) === b)
    let x = startX + headW + 22
    chain.forEach(node => {
      const c = colorsFor(node)
      g.append('line').attr('x1', x - 20).attr('y1', y + (rowH - 5) / 2).attr('x2', x - 4).attr('y2', y + (rowH - 5) / 2)
        .attr('stroke', '#94a3b8').attr('stroke-width', 1.5).attr('marker-end', 'url(#arrow)')
      g.append('rect').attr('x', x).attr('y', y).attr('width', 48).attr('height', rowH - 5).attr('rx', 4)
        .attr('fill', c.fill).attr('stroke', c.stroke).attr('stroke-width', 1.5)
      g.append('text').attr('x', x + 24).attr('y', y + (rowH - 5) / 2 + 4).attr('text-anchor', 'middle')
        .attr('font-size', 11).attr('font-weight', 600).attr('fill', c.text).text(truncate(node.value || node.label, 5))
      x += 70
    })
  }
}

// ---------- 教学辅助 ----------
function renderPointer(svg, nodes, edges, width, height) {
  const boxW = 100, boxH = 56, margin = 40
  const startX = (width - boxW * 2 - margin) / 2
  const startY = (height - boxH) / 2
  const g = svg.append('g')
  const pointerNode = nodes.find(n => n.label?.toLowerCase().includes('ptr') || n.id === 'ptr') || nodes[0]
  const targetNode = nodes.find(n => n.id !== pointerNode?.id) || null
  if (pointerNode) drawBox(g, startX, startY, boxW, boxH, pointerNode)
  if (targetNode) {
    drawBox(g, startX + boxW + margin, startY, boxW, boxH, targetNode)
    g.append('line').attr('x1', startX + boxW).attr('y1', startY + boxH / 2)
      .attr('x2', startX + boxW + margin - 8).attr('y2', startY + boxH / 2)
      .attr('stroke', '#94a3b8').attr('stroke-width', 2).attr('marker-end', 'url(#arrow)')
    addArrowMarker(svg)
  }
}

function renderLoop(svg, nodes, width, height) {
  const cx = width / 2, cy = height / 2
  const r = Math.min(width, height) / 3
  const g = svg.append('g')
  g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', r).attr('fill', 'none')
    .attr('stroke', '#ef4444').attr('stroke-width', 3).attr('stroke-dasharray', '8 4')
  const arc = d3.arc().innerRadius(r).outerRadius(r).startAngle(0).endAngle(Math.PI * 1.5)
  g.append('path').attr('d', arc).attr('transform', `translate(${cx},${cy})`)
    .attr('fill', 'none').attr('stroke', '#ef4444').attr('stroke-width', 3).attr('marker-end', 'url(#arrow)')
  g.append('text').attr('x', cx).attr('y', cy + 5).attr('text-anchor', 'middle')
    .attr('font-size', 14).attr('font-weight', 600).attr('fill', '#dc2626').text(truncate(nodes[0]?.value || '循环条件', 20))
  addArrowMarker(svg)
}

function renderEmpty(svg, width, height) {
  svg.append('text').attr('x', width / 2).attr('y', height / 2).attr('text-anchor', 'middle')
    .attr('font-size', 14).attr('fill', '#94a3b8').text('当前步骤无可视化状态')
}

// 标量变量视图：无数据结构可画时，把当前作用域的变量画成带名字的值盒子（自动换行居中）
function renderScalars(svg, nodes, width, height) {
  const items = (nodes || []).filter(n => n && (String(n.label ?? '') !== '' || String(n.value ?? '') !== ''))
  if (!items.length) return renderEmpty(svg, width, height)
  const boxW = 96, boxH = 50, gapX = 22, gapY = 42, padTop = 30
  const perRow = Math.max(1, Math.floor((width - 24 + gapX) / (boxW + gapX)))
  const rows = Math.ceil(items.length / perRow)
  const totalH = rows * boxH + (rows - 1) * gapY
  const startY = Math.max(padTop, (height - totalH) / 2 + 6)
  items.forEach((node, i) => {
    const row = Math.floor(i / perRow)
    const colCount = Math.min(perRow, items.length - row * perRow)
    const rowW = colCount * boxW + (colCount - 1) * gapX
    const startX = Math.max(12, (width - rowW) / 2)
    const x = startX + (i % perRow) * (boxW + gapX)
    const y = startY + row * (boxH + gapY)
    const c = colorsFor(node)
    const g = svg.append('g')
    g.append('text').attr('x', x + boxW / 2).attr('y', y - 9).attr('text-anchor', 'middle')
      .attr('font-size', 12).attr('font-weight', 600).attr('fill', '#64748b').text(truncate(node.label, 12))
    g.append('rect').attr('x', x).attr('y', y).attr('width', boxW).attr('height', boxH).attr('rx', 8)
      .attr('fill', c.fill).attr('stroke', c.stroke).attr('stroke-width', 2).attr('stroke-dasharray', c.dash)
    g.append('text').attr('x', x + boxW / 2).attr('y', y + boxH / 2 + 6).attr('text-anchor', 'middle')
      .attr('font-size', 16).attr('font-weight', 700).attr('fill', c.text).text(truncate(node.value, 12))
  })
}

function bound(v, min, max) { return Math.max(min, Math.min(max, v)) }
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
