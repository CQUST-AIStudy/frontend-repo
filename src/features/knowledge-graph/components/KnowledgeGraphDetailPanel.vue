<script setup>
import { computed } from 'vue'
import LucideIcon from '@/components/LucideIcon.vue'
import { getNodeTypeMeta, getRelationTypeMeta } from '../graphDatabaseAdapter'

const props = defineProps({
  context: {
    type: Object,
    default: null
  }
})

const context = computed(() => props.context || null)
const node = computed(() => props.context?.node || null)
const meta = computed(() => getNodeTypeMeta(node.value?.type))
const keywords = computed(() => node.value?.properties?.keywords || [])
const relationGroups = computed(() => {
  if (!context.value) return []
  return [
    { title: '前置知识', icon: 'arrow-up-right', items: context.value.prerequisites },
    { title: '后续知识', icon: 'trend', items: context.value.nextNodes },
    { title: '关联知识', icon: 'link', items: context.value.relatedNodes },
    { title: '关联练习', icon: 'target', items: context.value.exercises }
  ]
})
</script>

<template>
  <aside class="detail-panel" aria-label="知识点详情">
    <ui-empty v-if="!node" description="请选择一个节点查看详情" />

    <template v-else>
      <div class="detail-head">
        <span class="type-icon" :style="{ backgroundColor: meta.softColor, color: meta.color }">
          <LucideIcon :name="meta.icon" :size="18" />
        </span>
        <div class="detail-title-wrap">
          <span class="type-label">{{ meta.label }}</span>
          <h2 class="detail-title">{{ node.label }}</h2>
        </div>
      </div>

      <p class="detail-summary">{{ node.summary || '暂无简介' }}</p>

      <div v-if="context.ancestorChain.length" class="breadcrumb-line">
        <span v-for="(item, index) in context.ancestorChain" :key="item.id">
          {{ item.label }}<i v-if="index < context.ancestorChain.length - 1">/</i>
        </span>
      </div>

      <dl class="property-list">
        <div v-if="node.properties.definition">
          <dt>定义</dt>
          <dd>{{ node.properties.definition }}</dd>
        </div>
        <div v-if="node.properties.studyTip">
          <dt>学习建议</dt>
          <dd>{{ node.properties.studyTip }}</dd>
        </div>
        <div v-if="node.properties.difficulty">
          <dt>练习难度</dt>
          <dd>{{ node.properties.difficulty }}</dd>
        </div>
        <div v-if="node.properties.estimatedMinutes">
          <dt>建议时长</dt>
          <dd>{{ node.properties.estimatedMinutes }} 分钟</dd>
        </div>
      </dl>

      <div v-if="keywords.length" class="keyword-list">
        <span v-for="keyword in keywords" :key="keyword">{{ keyword }}</span>
      </div>

      <section v-for="group in relationGroups" :key="group.title" class="relation-section">
        <div class="relation-title">
          <LucideIcon :name="group.icon" :size="15" />
          {{ group.title }}
        </div>
        <ui-empty v-if="group.items.length === 0" description="暂无数据" class="mini-empty" />
        <div v-else class="relation-list">
          <article v-for="item in group.items" :key="item.id" class="relation-item">
            <span :style="{ backgroundColor: getNodeTypeMeta(item.type).softColor, color: getNodeTypeMeta(item.type).textColor }">
              {{ getNodeTypeMeta(item.type).label }}
            </span>
            <strong>{{ item.label }}</strong>
          </article>
        </div>
      </section>

      <section class="relation-section">
        <div class="relation-title">
          <LucideIcon name="network" :size="15" />
          直接关系
        </div>
        <div class="edge-list">
          <span v-for="relation in [...context.incoming, ...context.outgoing]" :key="relation.id">
            {{ getRelationTypeMeta(relation.type).label }}
          </span>
        </div>
      </section>
    </template>
  </aside>
</template>

<style scoped>
.detail-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  height: 100%;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.detail-head {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.type-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  border-radius: 8px;
}

.detail-title-wrap {
  min-width: 0;
}

.type-label {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.detail-title {
  overflow: hidden;
  margin: 3px 0 0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 850;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-summary {
  margin: 0;
  color: #475569;
  font-size: 13px;
  line-height: 1.7;
}

.breadcrumb-line {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.breadcrumb-line i {
  margin-left: 4px;
  color: #cbd5e1;
  font-style: normal;
}

.property-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
}

.property-list div {
  padding: 10px;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  background: #f8fafc;
}

.property-list dt {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.property-list dd {
  margin: 5px 0 0;
  color: #0f172a;
  font-size: 13px;
  line-height: 1.6;
}

.keyword-list,
.edge-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.keyword-list span,
.edge-list span {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 800;
}

.relation-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.relation-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #334155;
  font-size: 13px;
  font-weight: 850;
}

.relation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.relation-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 9px;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  background: #fff;
}

.relation-item span {
  flex-shrink: 0;
  padding: 3px 6px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 800;
}

.relation-item strong {
  overflow: hidden;
  color: #0f172a;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mini-empty {
  min-height: 60px;
}
</style>
