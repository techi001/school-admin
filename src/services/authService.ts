import api from './api';
import { AuthResponse, LoginRequest, ResetPasswordRequest } from '../types';

export const authService = {
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        try {
            const isMobile = /^\d{10}$/.test(credentials.mobileNumber);
            const payload = isMobile
                ? { mobileNumber: credentials.mobileNumber, password: credentials.password }
                : { username: credentials.mobileNumber, password: credentials.password };

            const response = await api.post('/auth/login', payload);

            const data = response.data;

            // Validate that the user is a school_admin
            if (data.role !== 'school_admin') {
                throw new Error('Unauthorized. This portal is for School Administrators only.');
            }

            // Map API response to our AuthResponse format
            return {
                token: data.accessToken,
                user: {
                    id: data.id,
                    mobileNumber: data.mobileNumber,
                    name: data.username || 'School Admin',
                    email: data.email || '',
                    role: data.role,
                    schoolId: data.schoolId,
                    isFirstLogin: data.requirePasswordReset || false
                }
            };
        } catch (error: any) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw error;
        }
    },

    async resetPassword(data: ResetPasswordRequest, currentPassword: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await api.post('/auth/change-password', {
                currentPassword: currentPassword,
                newPassword: data.newPassword
            });

            return {
                success: true,
                message: response.data.message || 'Password changed successfully'
            };
        } catch (error: any) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw error;
        }
    },

    async updateProfile(data: { name?: string; email?: string }): Promise<{ success: boolean; user: any; message: string }> {
        try {
            const response = await api.put('/auth/profile', data);
            return {
                success: true,
                user: response.data.user,
                message: response.data.message || 'Profile updated successfully'
            };
        } catch (error: any) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tempPassword');
        window.location.href = '/login';
    },
};
