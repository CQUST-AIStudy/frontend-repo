<template>
  <div class="min-h-screen bg-[#f1f5f9] p-6">
    <div class="mx-auto max-w-[1400px]">
      <h1 class="mb-1 text-xl font-bold text-[#172033]">数据结构渲染自测（PythonTutorRenderer）</h1>
      <p class="mb-6 text-sm text-[#64748b]">每张卡片喂一组样例 state，覆盖全部 {{ samples.length }} 种结构。开发自测用，路由 <code>/ds-preview</code>。</p>
      <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div v-for="s in samples" :key="s.title" class="overflow-hidden rounded-xl border border-[#dbe3ef] bg-white">
          <div class="flex items-center justify-between border-b border-[#e8edf4] px-4 py-2.5">
            <span class="text-sm font-semibold text-[#172033]">{{ s.title }}</span>
            <code class="rounded bg-[#eef2f7] px-2 py-0.5 text-[11px] text-[#64748b]">{{ s.state.dataStructure }}</code>
          </div>
          <div class="p-3">
            <PythonTutorRenderer :state="s.state" :height="230" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PythonTutorRenderer from '@/components/grading/PythonTutorRenderer.vue'

const N = (id, label, extra = {}) => ({ id, label, value: label, ...extra })

const samples = [
  { title: '数组 array', state: { dataStructure: 'array', nodes: [N('0','10'),N('1','20',{active:true}),N('2','30'),N('3','40'),N('4','50',{outOfBounds:true})] } },
  { title: '二维数组 / 矩阵 matrix', state: { dataStructure: 'matrix', rows: 3, cols: 4, nodes: Array.from({length:12},(_,i)=>N(String(i),String(i+1),{row:Math.floor(i/4),col:i%4,active:i===5})) } },
  { title: '串 string', state: { dataStructure: 'string', nodes: 'HELLO'.split('').map((c,i)=>N(String(i),c,{index:i,active:i===2})) } },
  { title: '单链表 linked-list', state: { dataStructure: 'linked-list', nodes: [N('a','10'),N('b','20',{active:true}),N('c','30')], edges: [{from:'a',to:'b',kind:'next'},{from:'b',to:'c',kind:'next'}], pointers: [{name:'pHead',target:'a'}] } },
  { title: '双链表 doubly-linked-list', state: { dataStructure: 'doubly-linked-list', nodes: [N('a','10'),N('b','20'),N('c','30',{active:true})], edges: [{from:'a',to:'b'},{from:'b',to:'c'}], pointers: [{name:'head',target:'a'}] } },
  { title: '循环链表 circular-linked-list', state: { dataStructure: 'circular-linked-list', nodes: [N('a','10'),N('b','20',{active:true}),N('c','30')], edges: [{from:'a',to:'b'},{from:'b',to:'c'}], pointers: [{name:'pHead',target:'a'}] } },
  { title: '静态链表 static-linked-list', state: { dataStructure: 'static-linked-list', nodes: [N('0','A',{index:0,cursor:2}),N('1','C',{index:1,cursor:-1}),N('2','B',{index:2,cursor:1,active:true})] } },
  { title: '栈 stack', state: { dataStructure: 'stack', nodes: [N('0','5'),N('1','8'),N('2','13',{active:true})], pointers: [{name:'top',target:'2'}] } },
  { title: '队列 queue', state: { dataStructure: 'queue', nodes: [N('0','A'),N('1','B'),N('2','C'),N('3','D')], pointers: [{name:'front',target:'0'},{name:'rear',target:'3'}] } },
  { title: '循环队列 circular-queue', state: { dataStructure: 'circular-queue', capacity: 6, nodes: [N('0','',{active:false}),N('1','7',{active:true}),N('2','3',{active:true}),N('3','9',{active:true}),N('4','',{active:false}),N('5','',{active:false})], pointers: [{name:'front',target:'1'},{name:'rear',target:'3'}] } },
  { title: '树 tree', state: { dataStructure: 'tree', nodes: [N('r','A'),N('b','B'),N('c','C',{active:true}),N('d','D'),N('e','E')], edges: [{from:'r',to:'b'},{from:'r',to:'c'},{from:'b',to:'d'},{from:'b',to:'e'}] } },
  { title: '二叉树 / BST binary-tree', state: { dataStructure: 'binary-tree', nodes: [N('50','50'),N('30','30'),N('70','70'),N('20','20'),N('40','40',{active:true}),N('60','60')], edges: [{from:'50',to:'30',kind:'child-left'},{from:'50',to:'70',kind:'child-right'},{from:'30',to:'20',kind:'child-left'},{from:'30',to:'40',kind:'child-right'},{from:'70',to:'60',kind:'child-left'}] } },
  { title: '堆 heap（完全二叉树）', state: { dataStructure: 'heap', nodes: [N('1','90',{index:1}),N('2','70',{index:2}),N('3','80',{index:3}),N('4','30',{index:4,active:true}),N('5','60',{index:5}),N('6','50',{index:6}),N('7','40',{index:7})] } },
  { title: '图 graph', state: { dataStructure: 'graph', nodes: [N('A','A'),N('B','B',{active:true}),N('C','C'),N('D','D')], edges: [{from:'A',to:'B',label:'5'},{from:'B',to:'C',label:'3'},{from:'A',to:'C',label:'8'},{from:'C',to:'D',label:'2'}] } },
  { title: '邻接矩阵 adjacency-matrix', state: { dataStructure: 'adjacency-matrix', nodes: [N('A','A'),N('B','B'),N('C','C'),N('D','D')], edges: [{from:'A',to:'B'},{from:'B',to:'C'},{from:'A',to:'C'},{from:'C',to:'D'}] } },
  { title: '邻接表 adjacency-list', state: { dataStructure: 'adjacency-list', nodes: [N('A','A'),N('B','B'),N('C','C'),N('D','D')], edges: [{from:'A',to:'B'},{from:'A',to:'C'},{from:'B',to:'C'},{from:'C',to:'D'}] } },
  { title: '哈希表 hash-table（拉链）', state: { dataStructure: 'hash-table', buckets: 5, nodes: [N('a','12',{slot:2}),N('b','7',{slot:2,active:true}),N('c','23',{slot:3}),N('d','9',{slot:4}),N('e','14',{slot:4})] } },
  { title: '指针 pointer', state: { dataStructure: 'pointer', nodes: [N('ptr','ptr',{active:true}),N('t','value:42')] } },
  { title: '循环 loop', state: { dataStructure: 'loop', nodes: [N('0','i < n 恒成立')] } },
  { title: '兜底 code', state: { dataStructure: 'code', nodes: [] } }
]
</script>
