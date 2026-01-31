// Mock booking data
import { Booking } from '../types';

export const mockBookings: Booking[] = [
    {
        id: 'BK001',
        bookingIdStr: 'BK001',
        service: {
            name: 'Speech Therapy'
        },
        date: '2026-01-20T09:00:00.000Z',
        parent: {
            fatherName: 'Rajesh Kumar',
            motherName: 'Sunita Kumar',
            primaryContact: '+91-9876543210',
            email: 'rajesh.kumar@email.com',
            address: '123 Main St, Bangalore',
            location: 'Indiranagar'
        },
        child: {
            name: 'Ananya Kumar',
            age: 5,
            disabilityType: 'Speech Delay',
            disabilityPercent: 20
        },
        amount: 1500,
        status: 'booked',
        paymentStatus: 'paid'
    },
    {
        id: 'BK002',
        bookingIdStr: 'BK002',
        service: {
            name: 'Occupational Therapy'
        },
        date: '2026-01-22T12:00:00.000Z',
        parent: {
            fatherName: 'Priya Sharma',
            motherName: 'Rahul Sharma',
            primaryContact: '+91-9123456789',
            email: 'priya.sharma@email.com',
            address: '456 Cross Rd, Mumbai',
            location: 'Bandra'
        },
        child: {
            name: 'Arjun Sharma',
            age: 7,
            disabilityType: 'Autism',
            disabilityPercent: 40
        },
        amount: 1800,
        status: 'booked',
        paymentStatus: 'paid'
    },
    {
        id: 'BK003',
        bookingIdStr: 'BK003',
        service: {
            name: 'Behavioral Therapy'
        },
        date: '2026-01-18T15:00:00.000Z',
        parent: {
            fatherName: 'Amit Patel',
            motherName: 'Neha Patel',
            primaryContact: '+91-9998887776',
            email: 'amit.patel@email.com',
            address: '789 Link Rd, Ahmedabad',
            location: 'Navrangpura'
        },
        child: {
            name: 'Riya Patel',
            age: 6,
            disabilityType: 'ADHD',
            disabilityPercent: 30
        },
        amount: 2000,
        status: 'completed',
        paymentStatus: 'paid'
    },
    {
        id: 'BK004',
        bookingIdStr: 'BK004',
        service: {
            name: 'Speech Therapy'
        },
        date: '2026-01-25T09:00:00.000Z',
        parent: {
            fatherName: 'Sneha Reddy',
            motherName: 'Vijay Reddy',
            primaryContact: '+91-8765432109',
            email: 'sneha.reddy@email.com',
            address: '321 Park Ave, Hyderabad',
            location: 'Jubilee Hills'
        },
        child: {
            name: 'Aditya Reddy',
            age: 4,
            disabilityType: 'Speech Delay',
            disabilityPercent: 15
        },
        amount: 1500,
        status: 'booked',
        paymentStatus: 'pending'
    },
    {
        id: 'BK005',
        bookingIdStr: 'BK005',
        service: {
            name: 'Art Therapy'
        },
        date: '2026-01-15T12:00:00.000Z',
        parent: {
            fatherName: 'Vikram Singh',
            motherName: 'Anjali Singh',
            primaryContact: '+91-9345678901',
            email: 'vikram.singh@email.com',
            address: '654 Lake View, Udaipur',
            location: 'Fateh Sagar'
        },
        child: {
            name: 'Kavya Singh',
            age: 8,
            disabilityType: 'None',
            disabilityPercent: 0
        },
        amount: 1200,
        status: 'cancelled',
        paymentStatus: 'refunded'
    },
    // Add more bookings to show pagination
    ...Array.from({ length: 15 }, (_, i) => ({
        id: `BK${String(i + 6).padStart(3, '0')}`,
        bookingIdStr: `BK${String(i + 6).padStart(3, '0')}`,
        service: {
            name: ['Speech Therapy', 'Occupational Therapy', 'Behavioral Therapy', 'Art Therapy'][i % 4]
        },
        date: `2026-01-${String(20 + (i % 10)).padStart(2, '0')}T${['09:00:00', '12:00:00', '15:00:00'][i % 3]}.000Z`,
        parent: {
            fatherName: `Father ${i + 6}`,
            motherName: `Mother ${i + 6}`,
            primaryContact: `+91-${9000000000 + i}`,
            email: `parent${i + 6}@email.com`,
            address: `Address ${i + 6}`,
            location: `Location ${i + 6}`
        },
        child: {
            name: `Child ${i + 6}`,
            age: 4 + (i % 5),
            disabilityType: 'None',
            disabilityPercent: 0
        },
        amount: 1500 + (i % 5) * 200,
        status: ['booked', 'completed', 'cancelled'][i % 3] as 'booked' | 'completed' | 'cancelled',
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
