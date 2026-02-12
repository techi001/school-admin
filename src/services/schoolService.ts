import api from './api';

export interface SchoolProfile {
    id: number;
    name: string;
    tag?: string;
    address: string;
    city: string;
    landmark?: string;
    busStand?: string;
    metroStation?: string;
    latitude?: number;
    longitude?: number;
    image1?: string;
    image2?: string;
    image3?: string;
    image4?: string;
    image5?: string;
    image6?: string;
    image7?: string;
    image8?: string;
    image9?: string;
    image10?: string;
    logoUrl?: string;
    principalPhoto?: string;
    description?: string;
    achievements?: string[];
    amenities?: string[];
    servicesOffered?: string[];
    schoolNumber?: string;
}

export const schoolService = {
    async getProfile(schoolId: string | number): Promise<SchoolProfile> {
        const response = await api.get(`/schools/${schoolId}/profile`);
        return response.data;
    },

    async updateProfile(schoolId: string | number, data: Partial<SchoolProfile>): Promise<SchoolProfile> {
        const response = await api.put(`/schools/${schoolId}/profile`, data);
        return response.data.school;
    },

    async updateLocation(schoolId: string | number, latitude: number, longitude: number): Promise<SchoolProfile> {
        const response = await api.put(`/schools/${schoolId}/location`, { latitude, longitude });
        return response.data.school;
    },

    async getStats(schoolId: string | number, filters?: any) {
        const response = await api.get(`/schools/${schoolId}/stats`, { params: filters });
        return response.data;
    },

    async getBookings(schoolId: string | number, params?: any) {
        const response = await api.get(`/schools/${schoolId}/bookings`, { params });
        return response.data;
    },

    async getServices(schoolId: string | number) {
        const response = await api.get(`/schools/${schoolId}/services`);
        return response.data;
    },

    async getSchedule(schoolId: string | number) {
        const response = await api.get(`/schools/${schoolId}/schedule`);
        return response.data;
    },

    async blockDate(schoolId: string | number, serviceId: number, blockedDate: string, reason: string) {
        const response = await api.post('/schools/schedule/block', {
            schoolId,
            serviceId,
            blockedDate,
            reason
        });
        return response.data;
    },

    async unblockDate(schoolId: string | number, blockId: number) {
        const response = await api.delete(`/schools/${schoolId}/schedule/${blockId}`);
        return response.data;
    },

    async getRevenue(schoolId: string | number, filters?: any) {
        const response = await api.get(`/schools/${schoolId}/revenue`, { params: filters });
        return response.data;
    },

    async uploadImage(schoolId: string | number, file: File): Promise<string> {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.post(`/schools/${schoolId}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data.url;
    },

    async getSlots(schoolId: string | number, serviceId?: number, page?: number, limit?: number) {
        const params: any = {};
        if (serviceId) params.serviceId = serviceId;
        if (page) params.page = page;
        if (limit) params.limit = limit;

        const response = await api.get(`/schools/${schoolId}/slots`, { params });
        return response.data;
    },

    async createSlot(schoolId: string | number, data: any) {
        const response = await api.post(`/schools/${schoolId}/slots`, data);
        return response.data;
    },

    async updateSlot(slotId: string | number, data: any) {
        const response = await api.put(`/schools/slots/${slotId}`, data);
        return response.data;
    },

    async deleteSlot(slotId: string | number) {
        const response = await api.delete(`/schools/slots/${slotId}`);
        return response.data;
    },

    async getSlotAvailability(schoolId: string | number, date: string, serviceId?: number) {
        const params: any = { date };
        if (serviceId) params.serviceId = serviceId;
        const response = await api.get(`/schools/${schoolId}/slots/availability`, { params });
        return response.data;
    },

    async updateSlotAvailability(schoolId: string | number, date: string, updates: any[], options?: { fromDate?: string, endDate?: string }) {
        const payload: any = { date, updates, ...options };
        const response = await api.put(`/schools/${schoolId}/slots/availability`, payload);
        return response.data;
    }
};
