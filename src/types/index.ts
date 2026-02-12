// Booking types
export interface Booking {
    id: string; // or number, but keeping string for safety if using bookingIdStr as id in frontend
    bookingIdStr: string;
    date: string; // ISO string from JSON
    amount: number;
    status: 'booked' | 'completed' | 'cancelled';
    service?: {
        name: string;
    };
    parent?: {
        fatherName: string;
        motherName: string;
        primaryContact: string;
        email?: string;
        address?: string;
        location?: string;
    };
    child?: {
        name: string;
        age: number;
        gender?: string;
        dob?: string;
        aadharNumber?: string;
        disabilityType?: string;
        disabilityPercent?: number;
        schoolName?: string;
        schoolAddress?: string;
        schoolContactPerson?: string;
        schoolContactNumber?: string;
    };
    childAge?: number;
    specialRequirements?: string;
    parentEmail?: string;
    paymentStatus?: 'paid' | 'pending' | 'refunded';
    slot?: {
        slotName: string;
        startTime: string;
        endTime: string;
    };
}

// School types
export interface School {
    id: string;
    name: string;
    tag?: string;
    address: string;
    nearbyLandmark?: string;
    busStand?: string;
    metroStation?: string;
    location?: {
        lat: number;
        lng: number;
    };
    achievements: string[];
    amenities: string[];
    servicesOffered: string[];
    logoUrl?: string;
    principalPhotoUrl?: string;
    schoolImages: string[];
    schoolNumber?: string;
}

// Slot types
export interface TimeSlot {
    time: '9AM-12PM' | '12PM-3PM' | '3PM-6PM';
    capacity: number;
    booked: number;
    available: number;
}

export interface DaySlot {
    date: string;
    service: string;
    slots: TimeSlot[];
    isBlocked: boolean;
}

export interface SlotSchedule {
    service: string;
    dateRange: {
        from: string;
        to: string;
    };
    excludedDays: number[]; // 0-6 (Sunday = 0)
    slots: {
        '9AM-12PM': number;
        '12PM-3PM': number;
        '3PM-6PM': number;
    };
}

// User & Auth types
export interface User {
    id: string;
    mobileNumber: string;
    name: string;
    email: string;
    role: 'school_admin';
    schoolId: string;
    isFirstLogin: boolean;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface LoginRequest {
    mobileNumber: string;
    password: string;
}

export interface ResetPasswordRequest {
    newPassword: string;
}

// Chart data types
export interface ChartData {
    month: string;
    count: number;
    revenue?: number;
}

export interface FilterOptions {
    service?: string;
    year?: number;
    month?: number;
    status?: 'all' | 'upcoming' | 'cancelled' | 'completed';
}

export interface DashboardChartFilter {
    service?: string;
    year?: number;
    month?: number;
    status?: string;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
