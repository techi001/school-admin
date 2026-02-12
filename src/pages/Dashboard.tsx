import { useState, useEffect } from 'react';
import { Booking } from '../types';
import { useTheme, getTheme } from '../context/ThemeContext';
import { schoolService } from '../services/schoolService';
import { useAuth } from '../context/AuthContext';
import {
    ChevronLeft,
    ChevronRight,
    X,
    Phone,
    Mail,
    User,
    Baby,
    IndianRupee,
    CalendarDays,
    TrendingUp,
    DollarSign,
    Loader2
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
    const { isDark } = useTheme();
    const theme = getTheme(isDark);
    const { user } = useAuth();
    const schoolId = user?.schoolId;

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showMoreChildInfo, setShowMoreChildInfo] = useState(false);

    const [services, setServices] = useState<any[]>([]);
    const [statsSummary, setStatsSummary] = useState({ totalBookings: 0, upcomingCount: 0 });

    // Filters
    const currentYear = new Date().getFullYear();
    const [bookingChartFilter, setBookingChartFilter] = useState({
        service: '',
        year: currentYear,
        month: '',
        status: ''
    });

    const [revenueChartFilter, setRevenueChartFilter] = useState({
        service: '',
        year: currentYear,
        month: ''
    });

    const [itemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!selectedBooking) setShowMoreChildInfo(false);
    }, [selectedBooking]);

    useEffect(() => {
        if (schoolId) {
            fetchDashboardData();
        }
    }, [schoolId, bookingChartFilter, revenueChartFilter]);

    const fetchBookings = async () => {
        try {
            const result = await schoolService.getBookings(schoolId!, {
                page: currentPage,
                limit: itemsPerPage,
                status: activeTab
            });

            const mappedBookings: Booking[] = (result.bookings || []).map((b: any) => ({
                ...b,
                id: b.bookingIdStr || `BK-${b.id}`,
                status: (b.status === 'booked' ? 'upcoming' : b.status) as 'upcoming' | 'cancelled' | 'completed'
            }));

            setBookings(mappedBookings);
            // Calculate pages from total count
            const total = result.total || result.totalBookings || 0;
            setTotalPages(Math.ceil(total / itemsPerPage) || 1);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            // Fetch Services for filters
            const servicesData = await schoolService.getServices(schoolId!);
            // servicesData in getting services is already an array from backend
            setServices(Array.isArray(servicesData) ? servicesData : []);

            // Fetch Stats (Bookings Chart)
            const stats = await schoolService.getStats(schoolId!, bookingChartFilter);

            // Ensure chartData names are strings
            const safeChartData = (stats.chartData || []).map((d: any) => ({
                ...d,
                name: typeof d.name === 'object' ? JSON.stringify(d.name) : String(d.name)
            }));
            setChartData(safeChartData);
            setStatsSummary({
                totalBookings: stats.totalBookings || 0,
                upcomingCount: stats.upcomingCount || 0
            });

            // Fetch Revenue Data
            const revenue = await schoolService.getRevenue(schoolId!, revenueChartFilter);
            const formattedRevenue = (revenue || []).map((r: any) => {
                const [year, month] = r.month.split('-');
                const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' });
                return {
                    month: monthName,
                    revenue: r.total,
                    count: r.transactions?.length || 0
                };
            }).reverse();

            setRevenueData(formattedRevenue);

            // Initial bookings fetch
            // Bookings are handled by separate effect

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch bookings when tab or page changes
    useEffect(() => {
        if (schoolId) {
            fetchBookings();
        }
    }, [activeTab, currentPage]);

    // Derived variables for pagination - Logic removed as we use server side pagination
    // const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    // const startIndex = (currentPage - 1) * itemsPerPage;
    // const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);
    // Use bookings directly as it contains the current page data
    const paginatedBookings = bookings;

    const getStatusBadge = (status: string) => {
        const styles = {
            upcoming: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' },
            completed: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: 'rgba(16, 185, 129, 0.2)' },
            cancelled: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' },
        };
        const style = styles[status as keyof typeof styles] || styles.upcoming;

        return (
            <span style={{
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '20px',
                background: style.bg,
                color: style.color,
                border: `1px solid ${style.border}`,
                textTransform: 'capitalize'
            }}>
                {status}
            </span>
        );
    };

    const stats = [
        {
            icon: CalendarDays,
            label: 'Total Bookings',
            value: statsSummary.totalBookings,
            color: '#6366f1'
        },
        {
            icon: TrendingUp,
            label: 'Upcoming',
            value: statsSummary.upcomingCount,
            color: '#3b82f6'
        },
        {
            icon: DollarSign,
            label: 'Total Revenue',
            value: '₹' + revenueData.reduce((a, b) => a + (b.revenue || 0), 0).toLocaleString(),
            color: '#10b981'
        },
    ];

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
                <Loader2 style={{ width: '40px', height: '40px', color: '#6366f1', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: theme.textSecondary, fontWeight: 500 }}>Loading dashboard data...</p>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: theme.text, margin: 0 }}>Dashboard</h1>
                <p style={{ color: theme.textSecondary, marginTop: '8px' }}>Manage bookings and track your school's performance</p>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
            }}>
                {stats.map((stat) => (
                    <div key={stat.label} style={{
                        background: theme.card,
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${theme.cardBorder}`,
                        borderRadius: '16px',
                        padding: '24px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-30%',
                            right: '-10%',
                            width: '100px',
                            height: '100px',
                            background: stat.color,
                            borderRadius: '50%',
                            filter: 'blur(50px)',
                            opacity: 0.2
                        }} />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: `linear-gradient(135deg, ${stat.color}, ${stat.color}99)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '16px',
                                boxShadow: `0 8px 20px ${stat.color}40`
                            }}>
                                <stat.icon style={{ width: '24px', height: '24px', color: 'white' }} />
                            </div>
                            <p style={{ color: theme.textMuted, fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                                {stat.label}
                            </p>
                            <h3 style={{ color: theme.text, fontSize: '24px', fontWeight: 700, margin: 0 }}>
                                {stat.value}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Booking Table */}
            <div style={{
                background: theme.card,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: '20px',
                padding: '24px',
                marginBottom: '32px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h2 style={{ color: theme.text, fontSize: '18px', fontWeight: 600, margin: 0 }}>Upcoming Bookings</h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                                style={{
                                    padding: '8px 16px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: activeTab === tab ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : theme.input,
                                    color: activeTab === tab ? 'white' : theme.textSecondary,
                                    boxShadow: activeTab === tab ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
                                    transition: 'all 0.2s ease',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                        <thead>
                            <tr>
                                {['ID', 'Service', 'Date', 'Time', 'Parent', 'Child', 'Contact', 'Cost', 'Status'].map((h) => (
                                    <th key={h} style={{
                                        padding: '12px 16px',
                                        textAlign: 'left',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: theme.textMuted,
                                        borderBottom: `1px solid ${theme.cardBorder}`,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedBookings.length > 0 ? paginatedBookings.map((booking) => (
                                <tr key={booking.id} style={{ transition: 'background 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = theme.tableHover}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '16px', borderBottom: `1px solid ${theme.cardBorder}` }}>
                                        <button onClick={() => setSelectedBooking(booking)} style={{
                                            background: 'none', border: 'none', color: '#818cf8', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline'
                                        }}>{booking.id}</button>
                                    </td>
                                    <td style={{ padding: '16px', borderBottom: `1px solid ${theme.cardBorder}`, color: theme.text, fontWeight: 500 }}>{booking.service?.name}</td>
                                    <td style={{ padding: '16px', borderBottom: `1px solid ${theme.cardBorder}`, color: theme.textSecondary }}>{new Date(booking.date).toLocaleDateString('en-IN')}</td>
                                    <td style={{ padding: '16px', borderBottom: `1px solid ${theme.cardBorder}`, color: theme.textSecondary }}>
                                        {booking.slot ? `${booking.slot.startTime} - ${booking.slot.endTime}` : new Date(booking.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td style={{ padding: '16px', borderBottom: `1px solid ${theme.cardBorder}`, color: theme.textSecondary }}>{booking.parent?.fatherName || 'N/A'}</td>
                                    <td style={{ padding: '16px', borderBottom: `1px solid ${theme.cardBorder}`, color: theme.textSecondary }}>{booking.child?.name || 'N/A'}</td>
                                    <td style={{ padding: '16px', borderBottom: `1px solid ${theme.cardBorder}`, color: theme.textSecondary }}>{booking.parent?.primaryContact || 'N/A'}</td>
                                    <td style={{ padding: '16px', borderBottom: `1px solid ${theme.cardBorder}`, color: theme.text, fontWeight: 600 }}>₹{booking.amount}</td>
                                    <td style={{ padding: '16px', borderBottom: `1px solid ${theme.cardBorder}` }}>{getStatusBadge(booking.status)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: theme.textMuted }}>
                                        No bookings found for the selected filter
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
                        <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                            style={{ padding: '8px 12px', background: theme.input, border: `1px solid ${theme.cardBorder}`, borderRadius: '8px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: theme.textSecondary }}>
                            <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button key={page} onClick={() => setCurrentPage(page)} style={{
                                padding: '8px 14px', fontSize: '14px', fontWeight: 600, borderRadius: '8px', border: 'none', cursor: 'pointer',
                                background: currentPage === page ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : theme.input,
                                color: currentPage === page ? 'white' : theme.textSecondary,
                            }}>{page}</button>
                        ))}
                        <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                            style={{ padding: '8px 12px', background: theme.input, border: `1px solid ${theme.cardBorder}`, borderRadius: '8px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: theme.textSecondary }}>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                {/* Bookings by Service Chart */}
                <div style={{ background: theme.card, backdropFilter: 'blur(20px)', border: `1px solid ${theme.cardBorder}`, borderRadius: '20px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                        <h2 style={{ color: theme.text, fontSize: '18px', fontWeight: 600, margin: 0 }}>Total Slot Booked</h2>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select
                                style={{ background: theme.input, color: theme.text, border: `1px solid ${theme.inputBorder}`, padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}
                                value={bookingChartFilter.service}
                                onChange={(e) => setBookingChartFilter({ ...bookingChartFilter, service: e.target.value })}
                            >
                                <option value="" style={{ background: isDark ? '#1e293b' : '#ffffff', color: theme.text }}>All Services</option>
                                {services.map(s => <option key={s.id} value={s.id} style={{ background: isDark ? '#1e293b' : '#ffffff', color: theme.text }}>{s.name}</option>)}
                            </select>
                            <select
                                style={{ background: theme.input, color: theme.text, border: `1px solid ${theme.inputBorder}`, padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}
                                value={bookingChartFilter.year}
                                onChange={(e) => setBookingChartFilter({ ...bookingChartFilter, year: parseInt(e.target.value) })}
                            >
                                <option value={currentYear} style={{ background: isDark ? '#1e293b' : '#ffffff', color: theme.text }}>{currentYear}</option>
                                <option value={currentYear - 1} style={{ background: isDark ? '#1e293b' : '#ffffff', color: theme.text }}>{currentYear - 1}</option>
                            </select>
                            <select
                                style={{ background: theme.input, color: theme.text, border: `1px solid ${theme.inputBorder}`, padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}
                                value={bookingChartFilter.month}
                                onChange={(e) => setBookingChartFilter({ ...bookingChartFilter, month: e.target.value })}
                            >
                                <option value="" style={{ background: isDark ? '#1e293b' : '#ffffff', color: theme.text }}>All Months</option>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <option key={m} value={m} style={{ background: isDark ? '#1e293b' : '#ffffff', color: theme.text }}>
                                        {new Date(0, m - 1).toLocaleString('default', { month: 'short' })}
                                    </option>
                                ))}
                            </select>
                            <select
                                style={{ background: theme.input, color: theme.text, border: `1px solid ${theme.inputBorder}`, padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}
                                value={bookingChartFilter.status}
                                onChange={(e) => setBookingChartFilter({ ...bookingChartFilter, status: e.target.value })}
                            >
                                <option value="" style={{ background: isDark ? '#1e293b' : '#ffffff', color: theme.text }}>All Status</option>
                                <option value="upcoming" style={{ background: isDark ? '#1e293b' : '#ffffff', color: theme.text }}>Upcoming</option>
                                <option value="cancelled" style={{ background: isDark ? '#1e293b' : '#ffffff', color: theme.text }}>Cancelled</option>
                                <option value="completed" style={{ background: isDark ? '#1e293b' : '#ffffff', color: theme.text }}>Completed</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: isDark ? '#cbd5e1' : '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fill: isDark ? '#cbd5e1' : '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        background: isDark ? '#1e293b' : '#fff',
                                        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                        borderRadius: '12px',
                                        color: isDark ? '#f1f5f9' : '#0f172a',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                    cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                                />
                                <Bar dataKey="bookings" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                                <defs><linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient></defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div style={{ background: theme.card, backdropFilter: 'blur(20px)', border: `1px solid ${theme.cardBorder}`, borderRadius: '20px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                        <h2 style={{ color: theme.text, fontSize: '18px', fontWeight: 600, margin: 0 }}>Total Revenue</h2>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select
                                style={{ background: theme.input, color: theme.text, border: `1px solid ${theme.inputBorder}`, padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}
                                value={revenueChartFilter.service}
                                onChange={(e) => setRevenueChartFilter({ ...revenueChartFilter, service: e.target.value })}
                            >
                                <option value="" style={{ background: isDark ? '#1e293b' : '#ffffff', color: theme.text }}>All Services</option>
                                {services.map(s => <option key={s.id} value={s.id} style={{ background: isDark ? '#1e293b' : '#ffffff', color: theme.text }}>{s.name}</option>)}
                            </select>
                            <select
                                style={{ background: theme.input, color: theme.text, border: `1px solid ${theme.inputBorder}`, padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}
                                value={revenueChartFilter.year}
                                onChange={(e) => setRevenueChartFilter({ ...revenueChartFilter, year: parseInt(e.target.value) })}
                            >
                                <option value={currentYear} style={{ background: isDark ? '#1e293b' : '#ffffff', color: theme.text }}>{currentYear}</option>
                                <option value={currentYear - 1} style={{ background: isDark ? '#1e293b' : '#ffffff', color: theme.text }}>{currentYear - 1}</option>
                            </select>
                            <select
                                style={{ background: theme.input, color: theme.text, border: `1px solid ${theme.inputBorder}`, padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}
                                value={revenueChartFilter.month}
                                onChange={(e) => setRevenueChartFilter({ ...revenueChartFilter, month: e.target.value })}
                            >
                                <option value="" style={{ background: isDark ? '#1e293b' : '#ffffff', color: theme.text }}>All Months</option>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <option key={m} value={m} style={{ background: isDark ? '#1e293b' : '#ffffff', color: theme.text }}>{new Date(0, m - 1).toLocaleString('default', { month: 'short' })}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div style={{ height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                                <XAxis dataKey="month" tick={{ fill: theme.textMuted, fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: theme.textMuted, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                                <Tooltip contentStyle={{ background: isDark ? '#1e293b' : '#fff', border: `1px solid ${theme.cardBorder}`, borderRadius: '12px', color: theme.text }} formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                                <Bar dataKey="revenue" fill="url(#revenueGradient)" radius={[8, 8, 0, 0]} />
                                <defs><linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#059669" /></linearGradient></defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            {selectedBooking && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }} onClick={() => setSelectedBooking(null)}>
                    <div style={{ background: isDark ? '#1e293b' : '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '800px', border: `1px solid ${theme.cardBorder}`, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ padding: '24px', borderBottom: `1px solid ${theme.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h2 style={{ color: theme.text, fontSize: '20px', fontWeight: 700, margin: 0 }}>Booking Details</h2>
                            <button onClick={() => setSelectedBooking(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                <X style={{ width: '20px', height: '20px', color: theme.textMuted }} />
                            </button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <div>
                                    <p style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '4px' }}>Booking ID</p>
                                    <p style={{ color: theme.text, fontSize: '18px', fontWeight: 700 }}>{selectedBooking.id}</p>
                                </div>
                                {getStatusBadge(selectedBooking.status)}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ padding: '16px', background: theme.input, borderRadius: '12px', border: `1px solid ${theme.inputBorder}` }}>
                                    <p style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>Service</p>
                                    <p style={{ color: theme.text, fontSize: '16px', fontWeight: 600 }}>{selectedBooking.service?.name}</p>
                                    <p style={{ color: theme.textSecondary, fontSize: '14px', marginTop: '8px' }}>
                                        {new Date(selectedBooking.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • {selectedBooking.slot ? `${selectedBooking.slot.startTime} - ${selectedBooking.slot.endTime}` : new Date(selectedBooking.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    {/* Parent Profile */}
                                    <div style={{ padding: '20px', background: theme.input, borderRadius: '16px', border: `1px solid ${theme.inputBorder}` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: `1px solid ${theme.cardBorder}`, paddingBottom: '12px' }}>
                                            <User style={{ width: '20px', height: '20px', color: '#818cf8' }} />
                                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: theme.text, margin: 0 }}>Parent Profile</h3>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div>
                                                <p style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>Father's Name</p>
                                                <p style={{ fontSize: '14px', color: theme.text, fontWeight: 600, margin: 0 }}>{selectedBooking.parent?.fatherName || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>Mother's Name</p>
                                                <p style={{ fontSize: '14px', color: theme.text, fontWeight: 600, margin: 0 }}>{selectedBooking.parent?.motherName || 'N/A'}</p>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                <div>
                                                    <p style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>Contact</p>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Phone style={{ width: '12px', height: '12px', color: theme.textSecondary }} />
                                                        <p style={{ fontSize: '13px', color: theme.text, margin: 0 }}>{selectedBooking.parent?.primaryContact || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>Email</p>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Mail style={{ width: '12px', height: '12px', color: theme.textSecondary }} />
                                                        <p style={{ fontSize: '13px', color: theme.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedBooking.parent?.email || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>Address</p>
                                                <p style={{ fontSize: '13px', color: theme.textSecondary, margin: 0, lineHeight: '1.4' }}>{selectedBooking.parent?.address || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>Location</p>
                                                <p style={{ fontSize: '13px', color: theme.textSecondary, margin: 0 }}>{selectedBooking.parent?.location || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Child Profile */}
                                    <div style={{ padding: '20px', background: theme.input, borderRadius: '16px', border: `1px solid ${theme.inputBorder}` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: `1px solid ${theme.cardBorder}`, paddingBottom: '12px' }}>
                                            <Baby style={{ width: '20px', height: '20px', color: '#a78bfa' }} />
                                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: theme.text, margin: 0 }}>Child Profile</h3>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div>
                                                <p style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>Child Name</p>
                                                <p style={{ fontSize: '14px', color: theme.text, fontWeight: 600, margin: 0 }}>{selectedBooking.child?.name || 'N/A'}</p>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                <div>
                                                    <p style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>Age</p>
                                                    <p style={{ fontSize: '14px', color: theme.text, fontWeight: 600, margin: 0 }}>{selectedBooking.child?.age || 0} Years</p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>Aadhar No</p>
                                                    <p style={{ fontSize: '14px', color: theme.text, fontWeight: 600, margin: 0 }}>{selectedBooking.child?.aadharNumber || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>Disability Type</p>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '4px 10px',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    color: '#f43f5e',
                                                    background: 'rgba(244, 63, 94, 0.1)',
                                                    borderRadius: '8px',
                                                    marginTop: '2px'
                                                }}>
                                                    {selectedBooking.child?.disabilityType || 'None'}
                                                </span>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>Disability Percentage</p>
                                                <div style={{ width: '100%', height: '6px', background: theme.cardBorder, borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${selectedBooking.child?.disabilityPercent || 0}%`, height: '100%', background: 'linear-gradient(90deg, #f43f5e, #fb7185)', borderRadius: '3px' }} />
                                                </div>
                                                <p style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px', textAlign: 'right' }}>{selectedBooking.child?.disabilityPercent || 0}%</p>
                                            </div>

                                            <button
                                                onClick={() => setShowMoreChildInfo(!showMoreChildInfo)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#818cf8',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    marginTop: '12px',
                                                    padding: 0
                                                }}
                                            >
                                                {showMoreChildInfo ? 'View Less Details' : 'View More Details'}
                                            </button>

                                            {showMoreChildInfo && (
                                                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: `1px solid ${theme.cardBorder}`, paddingTop: '16px' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                        <div>
                                                            <p style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>Date of Birth</p>
                                                            <p style={{ fontSize: '13px', color: theme.text, fontWeight: 500, margin: 0 }}>{selectedBooking.child?.dob || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>Gender</p>
                                                            <p style={{ fontSize: '13px', color: theme.text, fontWeight: 500, margin: 0 }}>{selectedBooking.child?.gender || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>Current School</p>
                                                        <p style={{ fontSize: '13px', color: theme.text, fontWeight: 500, margin: 0 }}>{selectedBooking.child?.schoolName || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>School Contact Info</p>
                                                        <p style={{ fontSize: '13px', color: theme.text, fontWeight: 500, margin: 0 }}>
                                                            {selectedBooking.child?.schoolContactPerson || 'N/A'} {selectedBooking.child?.schoolContactNumber ? `(${selectedBooking.child.schoolContactNumber})` : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '16px', background: 'rgba(16,185,129,0.1)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <IndianRupee style={{ width: '18px', height: '18px', color: '#10b981' }} />
                                            <span style={{ color: theme.textMuted, fontSize: '14px' }}>Total Amount</span>
                                        </div>
                                        <span style={{ color: '#10b981', fontSize: '24px', fontWeight: 700 }}>₹{selectedBooking.amount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
