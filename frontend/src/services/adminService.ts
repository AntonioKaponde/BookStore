import api from './api';
import { User } from '../types';

export const adminService = {
  async getAllUsers(): Promise<User[]> {
    const { data } = await api.get<User[]>('/admin/users');
    return data;
  },

  async updateUserRole(id: string, role: string): Promise<User> {
    const { data } = await api.patch<User>(`/admin/users/${id}/role?role=${role}`);
    return data;
  },

  async getSystemLogs(): Promise<string[]> {
    const { data } = await api.get<string[]>('/admin/logs');
    return data;
  }
};
