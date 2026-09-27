import apiClient from './client'
import type { Notification } from '../store/notificationStore'

export const notificationsApi = {
  getNotifications: async (): Promise<Notification[]> => {
    const res = await apiClient.get<Notification[]>('/notifications')
    return res.data
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`)
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/read-all')
  },

  respondToInvite: async (notificationId: string, accept: boolean): Promise<{ status: string; accepted: boolean }> => {
    const res = await apiClient.post('/notifications/respond-invite', {
      notification_id: notificationId,
      accept,
    })
    return res.data
  },
}
