import { defineStore } from 'pinia'
import api from '../api'
import logger from '@/utils/logger'

const POLL_INTERVAL_MS = 60 * 1000

function unwrap(response) {
  // apiClient returns the response body; endpoints wrap payloads as { success, data }
  return response?.data ?? response ?? {}
}

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    items: [],
    unreadCount: 0,
    loading: false,
    pollTimer: null
  }),
  actions: {
    async fetchUnreadCount() {
      try {
        const payload = unwrap(await api.getNotificationUnreadCount())
        this.unreadCount = Number(payload?.unreadCount || 0)
      } catch (error) {
        logger.error('获取未读通知数失败:', error)
      }
    },

    async fetchNotifications(limit = 50) {
      this.loading = true
      try {
        const payload = unwrap(await api.getNotifications(limit))
        this.items = Array.isArray(payload?.items) ? payload.items : []
        this.unreadCount = Number(payload?.unreadCount || 0)
      } catch (error) {
        logger.error('获取通知列表失败:', error)
      } finally {
        this.loading = false
      }
    },

    async markRead(ids) {
      try {
        const payload = unwrap(await api.markNotificationsRead({ ids, all: false }))
        this.unreadCount = Number(payload?.unreadCount || 0)
        this.items = this.items.map(item =>
          ids.includes(item.id) ? { ...item, read: true } : item
        )
      } catch (error) {
        logger.error('标记通知已读失败:', error)
      }
    },

    async markAllRead() {
      try {
        const payload = unwrap(await api.markNotificationsRead({ all: true }))
        this.unreadCount = Number(payload?.unreadCount || 0)
        this.items = this.items.map(item => ({ ...item, read: true }))
      } catch (error) {
        logger.error('标记全部已读失败:', error)
      }
    },

    startPolling() {
      if (this.pollTimer) return
      this.fetchUnreadCount()
      this.pollTimer = setInterval(() => {
        this.fetchUnreadCount()
      }, POLL_INTERVAL_MS)
    },

    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer)
        this.pollTimer = null
      }
    }
  }
})
