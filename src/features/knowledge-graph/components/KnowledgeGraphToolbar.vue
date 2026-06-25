<script setup>
import LucideIcon from '@/components/LucideIcon.vue'

const props = defineProps({
  searchKeyword: {
    type: String,
    default: ''
  },
  nodeType: {
    type: String,
    default: 'all'
  },
  relationType: {
    type: String,
    default: 'all'
  },
  nodeTypeOptions: {
    type: Array,
    default: () => []
  },
  relationTypeOptions: {
    type: Array,
    default: () => []
  },
  chapterOptions: {
    type: Array,
    default: () => []
  },
  collapsedChapterIds: {
    type: Array,
    default: () => []
  },
  dataSource: {
    type: String,
    default: 'empty'
  }
})

const emit = defineEmits([
  'update:searchKeyword',
  'update:nodeType',
  'update:relationType',
  'update:collapsedChapterIds',
  'reset',
  'preview-payload',
  'export-json'
])

function updateSearch(event) {
  emit('update:searchKeyword', event.target.value)
}

function toggleChapter(chapterId) {
  const current = new Set(props.collapsedChapterIds)
  if (current.has(chapterId)) {
    current.delete(chapterId)
  } else {
    current.add(chapterId)
  }
  emit('update:collapsedChapterIds', Array.from(current))
}

function isCollapsed(chapterId) {
  return props.collapsedChapterIds.includes(chapterId)
}
</script>

<template>
  <section class="graph-toolbar" aria-label="知识图谱筛选工具">
    <label class="search-control">
      <LucideIcon name="search" :size="16" />
      <input
        :value="searchKeyword"
        type="search"
        placeholder="搜索知识点、算法、练习"
        @input="updateSearch"
      />
    </label>

    <label class="select-control">
      <span>节点类型</span>
      <select :value="nodeType" @change="emit('update:nodeType', $event.target.value)">
        <option v-for="option in nodeTypeOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </label>

    <label class="select-control">
      <span>关系类型</span>
      <select :value="relationType" @change="emit('update:relationType', $event.target.value)">
        <option v-for="option in relationTypeOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </label>

    <div class="toolbar-actions">
      <button type="button" class="tool-button" @click="emit('reset')">
        <LucideIcon name="refresh" :size="15" />
        重置
      </button>
      <button type="button" class="tool-button" @click="emit('export-json')">
        <LucideIcon name="braces" :size="15" />
        导出 JSON
      </button>
      <button type="button" class="tool-button ghost" @click="emit('preview-payload')">
        <LucideIcon name="code" :size="15" />
        预览图谱数据
      </button>
    </div>

    <div v-if="chapterOptions.length" class="toolbar-chapters">
      <span class="chapters-label">
        <LucideIcon name="layers" :size="14" />
        章节折叠
      </span>
      <div class="chapter-chips">
        <button
          v-for="chapter in chapterOptions"
          :key="chapter.value"
          type="button"
          :class="['chapter-chip', { collapsed: isCollapsed(chapter.value) }]"
          @click="toggleChapter(chapter.value)"
        >
          <LucideIcon :name="isCollapsed(chapter.value) ? 'chevron-right' : 'chevron-down'" :size="13" />
          {{ chapter.label }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.graph-toolbar {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(148px, 180px) minmax(148px, 180px) auto;
  gap: 12px;
  align-items: center;
  min-width: 0;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.search-control,
.select-control {
  display: flex;
  align-items: center;
  min-width: 0;
  height: 40px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}

.search-control {
  gap: 8px;
  padding: 0 12px;
  color: #64748b;
}

.search-control input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: #0f172a;
  font-size: 13px;
}

.select-control {
  gap: 8px;
  padding: 0 8px 0 12px;
}

.select-control span {
  flex-shrink: 0;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.select-control select {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.toolbar-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.tool-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #334155;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.tool-button.primary {
  border-color: #1270d8;
  background: #1270d8;
  color: #fff;
}

.tool-button.ghost {
  border-style: dashed;
  background: transparent;
  color: #64748b;
}

.tool-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toolbar-chapters {
  display: flex;
  align-items: center;
  gap: 10px;
  grid-column: 1 / -1;
  flex-wrap: wrap;
  padding-top: 4px;
}

.chapters-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.chapter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.chapter-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  background: #fff;
  color: #334155;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.chapter-chip.collapsed {
  border-color: #94a3b8;
  background: #f1f5f9;
  color: #94a3b8;
}

@media (max-width: 1080px) {
  .graph-toolbar {
    grid-template-columns: 1fr 1fr;
  }

  .search-control,
  .toolbar-actions {
    grid-column: 1 / -1;
  }
}

@media (max-width: 640px) {
  .graph-toolbar {
    grid-template-columns: 1fr;
  }

  .search-control,
  .toolbar-actions {
    grid-column: auto;
  }

  .toolbar-actions {
    flex-direction: column;
  }
}
</style>
