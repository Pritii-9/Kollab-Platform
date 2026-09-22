import { create } from 'zustand'
import { MOCK_NOTIFICATIONS } from '../utils/mockData'

export type NotificationType = 'test' | 'project' | 'team' | 'system'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  description: string
  timestamp: string
  read: boolean
  action?: string
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (n: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [] as Notification[],
  unreadCount: 0,

  markAsRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
      return { notifications, unreadCount: notifications.filter((n) => !n.read).length }
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  addNotification: (n) =>
    set((state) => {
      const notification: Notification = { ...n, id: `n${Date.now()}` }
      const notifications = [notification, ...state.notifications]
      return { notifications, unreadCount: notifications.filter((x) => !x.read).length }
    }),

  removeNotification: (id) =>
    set((state) => {
      const notifications = state.notifications.filter((n) => n.id !== id)
      return { notifications, unreadCount: notifications.filter((n) => !n.read).length }
    }),
}))
