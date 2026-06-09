<template>
  <component :is="ResolvedIcon" :size="size" :stroke-width="strokeWidth" aria-hidden="true" />
</template>

<script setup>
import { computed } from 'vue'
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Bot,
  Brain,
  Check,
  CheckCircle2,
  Circle,
  CircleX,
  Clipboard,
  ClipboardCheck,
  ClipboardList,
  Code2,
  FileCode2,
  FileText,
  Flame,
  Folder,
  Globe,
  Hash,
  Inbox,
  LayoutGrid,
  Library,
  Link as LinkIcon,
  ListChecks,
  Mail,
  MessageSquare,
  Network,
  Package,
  PenLine,
  PieChart,
  RefreshCw,
  Ruler,
  Scale,
  Send,
  Sparkles,
  Star,
  Tags,
  Target,
  ThumbsDown,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  TreePine,
  TriangleAlert,
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
  'arrow-up-right': ArrowUpRight,
  'bar-chart': BarChart3,
  bot: Bot,
  'book-open': BookOpen,
  brain: Brain,
  check: CheckCircle2,
  'check-mark': Check,
  'circle-x': CircleX,
  clipboard: ClipboardList,
  'clipboard-check': ClipboardCheck,
  'clipboard-text': Clipboard,
  code: Code2,
  'file-code': FileCode2,
  file: FileText,
  flame: Flame,
  folder: Folder,
  globe: Globe,
  hash: Hash,
  inbox: Inbox,
  'layout-grid': LayoutGrid,
  library: Library,
  link: LinkIcon,
  'list-checks': ListChecks,
  mail: Mail,
  'message-square': MessageSquare,
  network: Network,
  package: Package,
  pen: PenLine,
  'pie-chart': PieChart,
  refresh: RefreshCw,
  ruler: Ruler,
  scale: Scale,
  send: Send,
  sparkles: Sparkles,
  star: Star,
  tags: Tags,
  target: Target,
  'thumbs-down': ThumbsDown,
  'thumbs-up': ThumbsUp,
  'trend-down': TrendingDown,
  trend: TrendingUp,
  tree: TreePine,
  'triangle-alert': TriangleAlert,
  wrench: Wrench
}

const ResolvedIcon = computed(() => icons[props.name] || Circle)
</script>
