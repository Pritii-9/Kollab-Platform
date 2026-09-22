import apiClient from './client'
import type { BatchReport, PlacementReport } from '../types/report.types'

export const reportsApi = {
  getBatchReports: async (): Promise<BatchReport[]> => {
    const res = await apiClient.get<BatchReport[]>('/reports/batches')
    return res.data
  },

  getPlacementStats: async (): Promise<any[]> => {
    const res = await apiClient.get<any[]>('/reports/placement')
    return res.data
  },

  exportCsvUrl: `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'}/reports/export-csv`,

  getAnnouncements: async (): Promise<any[]> => {
    const res = await apiClient.get<any[]>('/reports/announcements')
    return res.data
  },

  createAnnouncement: async (announcement: { title: string; message: string; target_badge?: string }): Promise<any> => {
    const res = await apiClient.post<any>('/reports/announcements', announcement)
    return res.data
  },
}
