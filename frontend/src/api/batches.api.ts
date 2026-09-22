import apiClient from './client'
import type { Batch, CreateBatchData } from '../types/batch.types'

export const batchesApi = {
  listBatches: async (): Promise<Batch[]> => {
    const res = await apiClient.get<Batch[]>('/batches')
    return res.data
  },

  createBatch: async (data: CreateBatchData): Promise<Batch> => {
    const res = await apiClient.post<Batch>('/batches', {
      department: data.department,
      year: Number(data.year),
      section: data.section,
      coordinator: data.coordinator,
      academic_year: data.academicYear,
    })
    return res.data
  },

  deleteBatch: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/batches/${id}`)
    return res.data
  },
}
