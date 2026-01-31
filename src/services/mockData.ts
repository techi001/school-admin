// Mock booking data
import { Booking } from '../types';

export const mockBookings: Booking[] = [
    {
        id: 'BK001',
        serviceOptedin: 'Speech Therapy',
        slotBookedDate: '2026-01-20',
        slotTiming: '9AM-12PM',
        parentName: 'Rajesh Kumar',
        childName: 'Ananya Kumar',
        parentContact: '+91-9876543210',
        serviceCost: 1500,
        status: 'upcoming',
        childAge: 5,
        parentEmail: 'rajesh.kumar@email.com',
        paymentStatus: 'paid'
    },
    {
        id: 'BK002',
        serviceOptedin: 'Occupational Therapy',
        slotBookedDate: '2026-01-22',
        slotTiming: '12PM-3PM',
        parentName: 'Priya Sharma',
        childName: 'Arjun Sharma',
        parentContact: '+91-9123456789',
        serviceCost: 1800,
        status: 'upcoming',
        childAge: 7,
        parentEmail: 'priya.sharma@email.com',
        paymentStatus: 'paid'
    },
    {
        id: 'BK003',
        serviceOptedin: 'Behavioral Therapy',
        slotBookedDate: '2026-01-18',
        slotTiming: '3PM-6PM',
        parentName: 'Amit Patel',
        childName: 'Riya Patel',
        parentContact: '+91-9998887776',
        serviceCost: 2000,
        status: 'completed',
        childAge: 6,
        parentEmail: 'amit.patel@email.com',
        paymentStatus: 'paid'
    },
    {
        id: 'BK004',
        serviceOptedin: 'Speech Therapy',
        slotBookedDate: '2026-01-25',
        slotTiming: '9AM-12PM',
        parentName: 'Sneha Reddy',
        childName: 'Aditya Reddy',
        parentContact: '+91-8765432109',
        serviceCost: 1500,
        status: 'upcoming',
        childAge: 4,
        parentEmail: 'sneha.reddy@email.com',
        paymentStatus: 'pending'
    },
    {
        id: 'BK005',
        serviceOptedin: 'Art Therapy',
        slotBookedDate: '2026-01-15',
        slotTiming: '12PM-3PM',
        parentName: 'Vikram Singh',
        childName: 'Kavya Singh',
        parentContact: '+91-9345678901',
        serviceCost: 1200,
        status: 'cancelled',
        childAge: 8,
        parentEmail: 'vikram.singh@email.com',
        paymentStatus: 'refunded'
    },
    // Add more bookings to show pagination
    ...Array.from({ length: 15 }, (_, i) => ({
        id: `BK${String(i + 6).padStart(3, '0')}`,
        serviceOptedin: ['Speech Therapy', 'Occupational Therapy', 'Behavioral Therapy', 'Art Therapy'][i % 4],
        slotBookedDate: `2026-01-${String(20 + (i % 10)).padStart(2, '0')}`,
        slotTiming: ['9AM-12PM', '12PM-3PM', '3PM-6PM'][i % 3],
        parentName: `Parent ${i + 6}`,
        childName: `Child ${i + 6}`,
        parentContact: `+91-${9000000000 + i}`,
        serviceCost: 1500 + (i % 5) * 200,
        status: ['upcoming', 'completed', 'cancelled'][i % 3] as 'upcoming' | 'completed' | 'cancelled',
        childAge: 4 + (i % 5),
        parentEmail: `parent${i + 6}@email.com`,
        paymentStatus: ['paid', 'pending', 'refunded'][i % 3] as 'paid' | 'pending' | 'refunded'
    }))
];

// Mock chart data
export const mockChartData = {
    bookedSlots: [
        { month: 'Aug', count: 45, revenue: 67500 },
        { month: 'Sep', count: 52, revenue: 78000 },
        { month: 'Oct', count: 48, revenue: 72000 },
        { month: 'Nov', count: 61, revenue: 91500 },
        { month: 'Dec', count: 58, revenue: 87000 },
        { month: 'Jan', count: 42, revenue: 63000 },
    ],
};
