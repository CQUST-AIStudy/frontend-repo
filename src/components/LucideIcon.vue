<template>
  <component :is="ResolvedIcon" :size="size" :stroke-width="strokeWidth" aria-hidden="true" />
</template>

<script setup>
import { computed } from 'vue'
import {
  AlertTriangle,
  BarChart3,
  Bot,
  BookOpen,
  CheckCircle2,
  Circle,
  CircleX,
  ClipboardCheck,
  ClipboardList,
  FileCode2,
  FileText,
  Flame,
  Folder,
  Globe,
  Hash,
  Inbox,
  Library,
  Link as LinkIcon,
  Network,
  Package,
  PenLine,
  RefreshCw,
  Ruler,
  Scale,
  Tags,
  Target,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  TreePine,
  Wrench
} from 'lucide-vue-next'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 20
  },
  strokeWidth: {
    type: [Number, String],
    default: 1.8
  }
})

const icons = {
  'alert-triangle': AlertTriangle,
  'bar-chart': BarChart3,
  bot: Bot,
  'book-open': BookOpen,
  check: CheckCircle2,
  'circle-x': CircleX,
  'clipboard-check': ClipboardCheck,
  clipboard: ClipboardList,
  'file-code': FileCode2,
  file: FileText,
  flame: Flame,
  folder: Folder,
  globe: Globe,
  hash: Hash,
  inbox: Inbox,
  library: Library,
  link: LinkIcon,
  network: Network,
  package: Package,
  pen: PenLine,
  refresh: RefreshCw,
  ruler: Ruler,
  scale: Scale,
  tags: Tags,
  target: Target,
  'thumbs-down': ThumbsDown,
  'thumbs-up': ThumbsUp,
  trend: TrendingUp,
  tree: TreePine,
  wrench: Wrench
}

const ResolvedIcon = computed(() => icons[props.name] || Circle)
</script>
