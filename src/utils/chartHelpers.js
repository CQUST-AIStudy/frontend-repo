import logger from '@/utils/logger'
import { nextTick } from 'vue'

function resolveChartElement(chartRef) {
  const value = chartRef?.value ?? chartRef
  return value?.$el ?? value ?? null
}

function isChartElementReady(element) {
  return !!element && element.offsetWidth > 0 && element.offsetHeight > 0
}

function waitForChartContainers(chartRefs, timeout = 2000) {
  return new Promise((resolve) => {
    let observer = null
    let intervalId = null
    let timeoutId = null

    const cleanup = () => {
      if (observer) observer.disconnect()
      if (intervalId) clearInterval(intervalId)
      if (timeoutId) clearTimeout(timeoutId)
    }

    const getElements = () => chartRefs.map(resolveChartElement)

    const checkReady = () => {
      const elements = getElements()
      const ready = elements.length === chartRefs.length && elements.every(isChartElementReady)
      if (ready) {
        cleanup()
        resolve(true)
      }
      return ready
    }

    const setupObserver = () => {
      if (observer || typeof ResizeObserver === 'undefined') return
      const elements = getElements().filter(Boolean)
      if (!elements.length) return
      observer = new ResizeObserver(() => {
        checkReady()
      })
      elements.forEach(element => observer.observe(element))
    }

    timeoutId = setTimeout(() => {
      cleanup()
      resolve(false)
    }, timeout)

    intervalId = setInterval(() => {
      if (!checkReady()) {
        setupObserver()
      }
    }, 100)

    if (!checkReady()) {
      setupObserver()
    }
  })
}

function wait(delay) {
  return new Promise(resolve => setTimeout(resolve, delay))
}

/**
 * 安全地初始化echarts，包含错误处理和DOM检查
 * @param {Array} chartRefs - 包含图表容器refs的数组
 * @param {Function} initFunction - 图表初始化函数
 * @param {Number} delay - 可选的延迟时间
 */
export function safeInitCharts(chartRefs, initFunction, delay = 300) {
  if (!Array.isArray(chartRefs)) {
    logger.error('chartRefs必须是数组')
    return Promise.resolve(false)
  }

  return nextTick()
    .then(() => waitForChartContainers(chartRefs))
    .then(async (ready) => {
      if (!ready) {
        logger.error('等待DOM渲染超时，尝试继续初始化')
      }
      if (delay > 0) {
        await wait(delay)
      }
      try {
        initFunction()
        return true
      } catch (error) {
        logger.error('图表初始化失败:', error)
        return false
      }
    })
}
/**
 * 创建基本柱状图配置
 * @param {String} title - 图表标题
 * @param {Array} categories - X轴类别
 * @param {Array} data - 图表数据
 * @param {String} color - 图表颜色
 * @returns {Object} 图表配置
 */
export function createBarChartOptions(title, categories, data, color = '#409EFF') {
  return {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: categories
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data,
        type: 'bar',
        itemStyle: {
          color
        }
      }
    ]
  }
}

/**
 * 创建基本饼图配置
 * @param {String} title - 图表标题
 * @param {Array} data - 图表数据 [{name, value}]
 * @returns {Object} 图表配置
 */
export function createPieChartOptions(title, data) {
  return {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: '60%',
        data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
} 
