import { defineComponent, h } from 'vue'

const paths = {
  ArrowDown: 'M6 8l6 6 6-6',
  ArrowLeft: 'M14 6l-6 6 6 6',
  ArrowRight: 'M8 6l6 6-6 6',
  Back: 'M14 6l-6 6 6 6',
  Bell: 'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  Calendar: 'M7 4v4M17 4v4M5 8h14M6 6h12a2 2 0 0 1 2 2v12H4V8a2 2 0 0 1 2-2z',
  ChatDotRound: 'M5 18l-1 4 4-2h8a6 6 0 1 0 0-12H8a6 6 0 0 0-3 11z',
  ChatLineRound: 'M5 18l-1 4 4-2h8a6 6 0 1 0 0-12H8a6 6 0 0 0-3 11zM8 12h8',
  Check: 'M5 12l4 4L19 6',
  CircleCheck: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM7 12l3 3 7-7',
  CircleCheckFilled: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM7 12l3 3 7-7',
  CircleClose: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM8 8l8 8M16 8l-8 8',
  Clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  Close: 'M6 6l12 12M18 6L6 18',
  Collection: 'M5 5h14v14H5zM8 8h8M8 12h8M8 16h5',
  Connection: 'M8 12h8M7 7l10 10M17 7L7 17',
  CopyDocument: 'M8 8h11v13H8zM5 15H4V4h11v1',
  DataAnalysis: 'M5 19V9M12 19V5M19 19v-7',
  DataLine: 'M4 18l5-6 4 3 7-9',
  Delete: 'M5 7h14M10 11v6M14 11v6M7 7l1 14h8l1-14M10 7V4h4v3',
  Document: 'M7 3h8l5 5v13H7zM14 3v6h6M10 13h6M10 17h6',
  DocumentChecked: 'M7 3h8l5 5v13H7zM14 3v6h6M9 16l2 2 5-5',
  DocumentCopy: 'M8 8h11v13H8zM5 15H4V4h11v1',
  Download: 'M12 4v10M8 10l4 4 4-4M5 20h14',
  Edit: 'M5 19l4-1 10-10-3-3L6 15zM14 5l3 3',
  Expand: 'M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4',
  Finished: 'M5 12l4 4L19 6M4 20h16',
  Fold: 'M4 6h16M4 12h10M4 18h16',
  FullScreen: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  HomeFilled: 'M4 11l8-7 8 7v9h-5v-6H9v6H4z',
  Loading: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83',
  MagicStick: 'M4 20l10-10M12 4l1 3 3 1-3 1-1 3-1-3-3-1 3-1zM18 3l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z',
  Menu: 'M4 6h16M4 12h16M4 18h16',
  MoreFilled: 'M6 12h.01M12 12h.01M18 12h.01',
  Notebook: 'M7 4h12v16H7zM5 6h2M5 10h2M5 14h2M5 18h2',
  OfficeBuilding: 'M5 21V3h14v18M9 7h2M14 7h2M9 11h2M14 11h2M9 15h2M14 15h2',
  Plus: 'M12 5v14M5 12h14',
  Reading: 'M4 5h7a4 4 0 0 1 4 4v12a4 4 0 0 0-4-4H4zM20 5h-7a4 4 0 0 0-4 4',
  Refresh: 'M20 12a8 8 0 0 1-14 5M4 12a8 8 0 0 1 14-5M18 3v4h-4M6 21v-4h4',
  School: 'M3 9l9-5 9 5-9 5zM6 11v5c3 3 9 3 12 0v-5',
  Search: 'M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM21 21l-4.3-4.3',
  Select: 'M5 12l4 4L19 6',
  Setting: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-4l-.3 3a7 7 0 0 0-1.7 1L6.1 6 4.1 9.5l2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 1.7 1l.3 3h4l.3-3a7 7 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5c.1-.3.1-.7.1-1z',
  Stopwatch: 'M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 10v5l3 1M9 2h6',
  SwitchButton: 'M12 3v9M6.4 6.4a9 9 0 1 0 13.2 0',
  Timer: 'M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 10v4l3 2M9 2h6',
  Tickets: 'M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8zM12 6v12',
  TrendCharts: 'M4 18l6-6 4 4 6-10M15 6h5v5',
  UploadFilled: 'M12 17V5M7 10l5-5 5 5M5 20h14',
  User: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  UserFilled: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  VideoPlay: 'M5 5h14v14H5zM10 9l6 3-6 3z',
  View: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  Warning: 'M12 3l10 18H2zM12 9v5M12 17h.01',
  WarningFilled: 'M12 3l10 18H2zM12 9v5M12 17h.01',
  Briefcase: 'M8 7V5h8v2M4 7h20v14H4zM4 12h20'
}

function icon(name) {
  return defineComponent({
    name,
    setup(_, { attrs }) {
      return () => h('svg', {
        ...attrs,
        class: ['inline-block h-[1em] w-[1em] shrink-0', attrs.class],
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'aria-hidden': 'true'
      }, [
        h('path', { d: paths[name] || paths.Document })
      ])
    }
  })
}

export const ArrowDown = icon('ArrowDown')
export const ArrowLeft = icon('ArrowLeft')
export const ArrowRight = icon('ArrowRight')
export const Back = icon('Back')
export const Bell = icon('Bell')
export const Briefcase = icon('Briefcase')
export const Calendar = icon('Calendar')
export const ChatDotRound = icon('ChatDotRound')
export const ChatLineRound = icon('ChatLineRound')
export const Check = icon('Check')
export const CircleCheck = icon('CircleCheck')
export const CircleCheckFilled = icon('CircleCheckFilled')
export const CircleClose = icon('CircleClose')
export const Clock = icon('Clock')
export const Close = icon('Close')
export const Collection = icon('Collection')
export const Connection = icon('Connection')
export const CopyDocument = icon('CopyDocument')
export const DataAnalysis = icon('DataAnalysis')
export const DataLine = icon('DataLine')
export const Delete = icon('Delete')
export const Document = icon('Document')
export const DocumentChecked = icon('DocumentChecked')
export const DocumentCopy = icon('DocumentCopy')
export const Download = icon('Download')
export const Edit = icon('Edit')
export const Expand = icon('Expand')
export const Finished = icon('Finished')
export const Fold = icon('Fold')
export const FullScreen = icon('FullScreen')
export const HomeFilled = icon('HomeFilled')
export const List = icon('Document')
export const Loading = icon('Loading')
export const MagicStick = icon('MagicStick')
export const Menu = icon('Menu')
export const MoreFilled = icon('MoreFilled')
export const Notebook = icon('Notebook')
export const OfficeBuilding = icon('OfficeBuilding')
export const Plus = icon('Plus')
export const Reading = icon('Reading')
export const Refresh = icon('Refresh')
export const School = icon('School')
export const Search = icon('Search')
export const Select = icon('Select')
export const Setting = icon('Setting')
export const Stopwatch = icon('Stopwatch')
export const SwitchButton = icon('SwitchButton')
export const Timer = icon('Timer')
export const Tickets = icon('Tickets')
export const TrendCharts = icon('TrendCharts')
export const UploadFilled = icon('UploadFilled')
export const User = icon('User')
export const UserFilled = icon('UserFilled')
export const VideoPlay = icon('VideoPlay')
export const View = icon('View')
export const Warning = icon('Warning')
export const WarningFilled = icon('WarningFilled')

export const icons = {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Back,
  Bell,
  Briefcase,
  Calendar,
  ChatDotRound,
  ChatLineRound,
  Check,
  CircleCheck,
  CircleCheckFilled,
  CircleClose,
  Clock,
  Close,
  Collection,
  Connection,
  CopyDocument,
  DataAnalysis,
  DataLine,
  Delete,
  Document,
  DocumentChecked,
  DocumentCopy,
  Download,
  Edit,
  Expand,
  Finished,
  Fold,
  FullScreen,
  HomeFilled,
  List,
  Loading,
  MagicStick,
  Menu,
  MoreFilled,
  Notebook,
  OfficeBuilding,
  Plus,
  Reading,
  Refresh,
  School,
  Search,
  Select,
  Setting,
  Stopwatch,
  SwitchButton,
  Timer,
  Tickets,
  TrendCharts,
  UploadFilled,
  User,
  UserFilled,
  VideoPlay,
  View,
  Warning,
  WarningFilled
}

export function installUiIcons(app) {
  Object.entries(icons).forEach(([name, component]) => {
    app.component(name, component)
  })
}
