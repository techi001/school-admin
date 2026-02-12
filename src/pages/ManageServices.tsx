/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { useTheme, getTheme } from '../context/ThemeContext';
import { Plus, Edit, Trash2, X, Heart, Loader2, Clock } from 'lucide-react';

interface Slot {
    id: number;
    slotName: string;
    startTime: string;
    endTime: string;
    price: number;
    isActive: boolean;
}

interface Service {
    id: number;
    name: string;
    description?: string;
    duration: number;
    cost: number;
    schoolId?: number;
    phoneNumber?: string;
    advancedBookingEnabled: boolean;
    slots?: Slot[];
}

const DEFAULT_SLOTS = [
    { name: '9:00 AM - 12:00 PM', range: '' },
    { name: '12:00 PM - 3:00 PM', range: '' },
    { name: '3:00 PM - 6:00 PM', range: '' },
    { name: '6:00 PM - 9:00 PM', range: '' }
];

export default function ManageServices() {
    const { token, user } = useAuth();
    const { isDark } = useTheme();
    const theme = getTheme(isDark);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        cost: '',
        phoneNumber: '',
        advancedBookingEnabled: false,
    });
    const [slotPrices, setSlotPrices] = useState<any>({
        '9:00 AM - 12:00 PM': '0',
        '12:00 PM - 3:00 PM': '0',
        '3:00 PM - 6:00 PM': '0',
        '6:00 PM - 9:00 PM': '0'
    });
    const [slotUpdates, setSlotUpdates] = useState<any[]>([]);

    useEffect(() => {
        fetchServices();
    }, [token]);

    const fetchServices = async () => {
        try {
            const response = await api.get(`/schools/${user?.schoolId}/services`);
            setServices(response.data);
        } catch (error) {
            console.error('Error fetching services', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const serviceData: any = {
                ...formData,
                duration: 180,
                cost: Number(formData.cost),
                schoolId: user?.schoolId
            };

            if (editingService) {
                serviceData.slotUpdates = slotUpdates;
                await api.put(`/schools/service/${editingService.id}`, { ...serviceData, advancedBookingEnabled: formData.advancedBookingEnabled });
            } else {
                serviceData.slotPrices = slotPrices;
                await api.post(`/schools/${user?.schoolId}/service`, { ...serviceData, advancedBookingEnabled: formData.advancedBookingEnabled });
            }
            setIsModalOpen(false);
            setEditingService(null);
            setFormData({ name: '', description: '', cost: '', phoneNumber: '', advancedBookingEnabled: false });
            setSlotPrices({ '9:00 AM - 12:00 PM': '0', '12:00 PM - 3:00 PM': '0', '3:00 PM - 6:00 PM': '0', '6:00 PM - 9:00 PM': '0' });
            setSlotUpdates([]);
            fetchServices();
            Swal.fire({
                title: 'Success!',
                text: editingService ? 'Service and slots updated successfully.' : 'Service and default slots added successfully.',
                icon: 'success',
                confirmButtonColor: '#10b981'
            });
        } catch (error: any) {
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Error saving service',
                icon: 'error',
                confirmButtonColor: '#ef4444'
            });
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6366f1',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/schools/service/${id}`);
                fetchServices();
                Swal.fire(
                    'Deleted!',
                    'The service has been deleted.',
                    'success'
                );
            } catch (error: any) {
                console.error('Error deleting service', error);
                Swal.fire(
                    'Error',
                    error.response?.data?.message || 'Failed to delete service.',
                    'error'
                );
            }
        }
    };

    const openEditModal = (service: Service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            description: service.description || '',
            cost: service.cost.toString(),
            phoneNumber: service.phoneNumber || '',
            advancedBookingEnabled: service.advancedBookingEnabled || false
        });
        if (service.slots) {
            // Sort slots to match timing order
            const order = ['9:00 AM - 12:00 PM', '12:00 PM - 3:00 PM', '3:00 PM - 6:00 PM', '6:00 PM - 9:00 PM'];
            const sortedSlots = [...service.slots].sort((a, b) => order.indexOf(a.slotName) - order.indexOf(b.slotName));
            setSlotUpdates(sortedSlots.map(s => ({
                id: s.id,
                slotName: s.slotName,
                price: s.price.toString(),
                isActive: s.isActive,
                range: ''
            })));
        } else {
            setSlotUpdates([]);
        }
        setIsModalOpen(true);
    };

    const handleSlotPriceChange = (slotName: string, price: string) => {
        setSlotPrices({ ...slotPrices, [slotName]: price });
    };

    const handleSlotUpdateChange = (index: number, field: string, value: any) => {
        const newUpdates = [...slotUpdates];
        newUpdates[index] = { ...newUpdates[index], [field]: value };
        setSlotUpdates(newUpdates);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loader2 style={{ width: '40px', height: '40px', color: '#818cf8', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: theme.text, margin: 0 }}>School Services</h1>
                    <p style={{ color: theme.textSecondary, marginTop: '8px' }}>Manage daycare and special care services</p>
                </div>
                <button
                    onClick={() => {
                        setEditingService(null);
                        setFormData({ name: '', description: '', cost: '', phoneNumber: '', advancedBookingEnabled: false });
                        setSlotPrices({ '9:00 AM - 12:00 PM': '0', '12:00 PM - 3:00 PM': '0', '3:00 PM - 6:00 PM': '0', '6:00 PM - 9:00 PM': '0' });
                        setIsModalOpen(true);
                    }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        borderRadius: '12px',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '14px',
                        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                    }}
                >
                    <Plus style={{ width: '18px', height: '18px' }} />
                    Add Service
                </button>
            </div>

            {/* Services Grid */}
            {services.length === 0 ? (
                <div style={{
                    background: theme.card,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${theme.cardBorder}`,
                    borderRadius: '20px',
                    padding: '60px 20px',
                    textAlign: 'center'
                }}>
                    <Heart style={{ width: '48px', height: '48px', color: theme.textMuted, margin: '0 auto 16px', opacity: 0.5 }} />
                    <p style={{ color: theme.textMuted, fontSize: '16px' }}>No services available. Add services to get started.</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '20px'
                }}>
                    {services.map((service) => (
                        <div key={service.id} style={{
                            background: theme.card,
                            backdropFilter: 'blur(20px)',
                            border: `1px solid ${theme.cardBorder}`,
                            borderRadius: '20px',
                            padding: '24px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '-30%',
                                right: '-30%',
                                width: '120px',
                                height: '120px',
                                background: '#6366f1',
                                borderRadius: '50%',
                                filter: 'blur(50px)',
                                opacity: isDark ? 0.1 : 0.08
                            }} />

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '12px'
                                    }}>
                                        <Heart style={{ width: '24px', height: '24px', color: 'white' }} />
                                    </div>
                                    <h3 style={{ color: theme.text, fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                                        {service.name}
                                    </h3>
                                    {service.description && (
                                        <p style={{
                                            color: theme.textSecondary,
                                            fontSize: '14px',
                                            lineHeight: 1.6,
                                            marginBottom: '16px',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {service.description}
                                        </p>
                                    )}
                                    {service.phoneNumber && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', fontSize: '13px', color: theme.textSecondary }}>
                                            <span style={{ fontWeight: 600 }}>Phone:</span> {service.phoneNumber}
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    display: 'flex',
                                    gap: '12px',
                                    marginBottom: '16px',
                                    paddingTop: '16px',
                                    borderTop: `1px solid ${theme.cardBorder}`
                                }}>
                                    <div style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(99, 102, 241, 0.2)'
                                    }}>
                                        <p style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Duration</p>
                                        <p style={{ color: '#818cf8', fontSize: '16px', fontWeight: 700, margin: 0 }}>3 hr</p>
                                    </div>
                                    <div style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: 'rgba(34, 197, 94, 0.1)',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(34, 197, 94, 0.2)'
                                    }}>
                                        <p style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Base Cost</p>
                                        <p style={{ color: '#4ade80', fontSize: '16px', fontWeight: 700, margin: 0 }}>₹{service.cost}</p>
                                    </div>
                                </div>

                                {/* Per-Slot Costs */}
                                {service.slots && service.slots.length > 0 && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <p style={{ color: theme.textSecondary, fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Slot Pricing:</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            {Array.from(new Map(service.slots.map(slot => [slot.slotName, slot])).values()).map(slot => (
                                                <div key={slot.id} style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    padding: '8px 10px',
                                                    background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                                                    borderRadius: '8px',
                                                    fontSize: '11px',
                                                    border: `1px solid ${theme.cardBorder}`
                                                }}>
                                                    <span style={{ color: theme.textSecondary, fontWeight: 600 }}>{slot.slotName}</span>
                                                    <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '13px' }}>₹{slot.price}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <button
                                        onClick={() => openEditModal(service)}
                                        style={{
                                            padding: '10px',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(99, 102, 241, 0.3)',
                                            background: 'rgba(99, 102, 241, 0.1)',
                                            color: '#818cf8',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <Edit style={{ width: '14px', height: '14px' }} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(service.id)}
                                        style={{
                                            padding: '10px',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <Trash2 style={{ width: '14px', height: '14px' }} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50,
                    padding: '24px'
                }}>
                    <div style={{
                        background: isDark ? '#1e293b' : '#ffffff',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '550px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        border: `1px solid ${theme.cardBorder}`,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{ padding: '24px', borderBottom: `1px solid ${theme.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h2 style={{ color: theme.text, fontSize: '20px', fontWeight: 700, margin: 0 }}>
                                {editingService ? 'Edit Service' : 'Add New Service'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                <X style={{ width: '20px', height: '20px', color: theme.textMuted }} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: theme.textSecondary, marginBottom: '8px' }}>Service Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            background: theme.input,
                                            border: `1px solid ${theme.inputBorder}`,
                                            borderRadius: '10px',
                                            color: theme.text,
                                            fontSize: '14px',
                                            outline: 'none'
                                        }}
                                        placeholder="e.g., Daycare, After School Care"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: theme.textSecondary, marginBottom: '8px' }}>Description</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            background: theme.input,
                                            border: `1px solid ${theme.inputBorder}`,
                                            borderRadius: '10px',
                                            color: theme.text,
                                            fontSize: '14px',
                                            outline: 'none',
                                            resize: 'vertical'
                                        }}
                                        placeholder="Brief description of the service"
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: theme.textSecondary, marginBottom: '8px' }}>Duration</label>
                                        <div style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            background: theme.card,
                                            border: `1px solid ${theme.inputBorder}`,
                                            borderRadius: '10px',
                                            color: theme.textMuted,
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            cursor: 'not-allowed'
                                        }}>
                                            <span style={{ fontWeight: 700, color: theme.text }}>3 hr</span>
                                            <span style={{ fontSize: '12px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', padding: '2px 8px', borderRadius: '12px' }}>Fixed</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: theme.textSecondary, marginBottom: '8px' }}>Base Cost (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.cost}
                                            onChange={e => setFormData({ ...formData, cost: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '12px 14px',
                                                background: theme.input,
                                                border: `1px solid ${theme.inputBorder}`,
                                                borderRadius: '10px',
                                                color: theme.text,
                                                fontSize: '14px',
                                                outline: 'none'
                                            }}
                                            placeholder="500"
                                        />
                                    </div>
                                </div>

                                {/* Integrated Slot Prices - Fixed Slots */}
                                <div style={{ background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', padding: '20px', borderRadius: '16px', border: `1px solid ${theme.cardBorder}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                        <Clock style={{ width: '18px', height: '18px', color: '#818cf8' }} />
                                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: theme.text, margin: 0 }}>Slot Pricing (Fixed Slots)</h3>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        {editingService ? (
                                            slotUpdates.map((slot, index) => (
                                                <div key={slot.id}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                        <label style={{ fontSize: '12px', fontWeight: 600, color: theme.textSecondary }}>{slot.slotName}</label>
                                                        <span style={{ fontSize: '10px', color: theme.textMuted }}>{slot.range}</span>
                                                    </div>
                                                    <div style={{ position: 'relative' }}>
                                                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.textMuted, fontSize: '13px' }}>₹</span>
                                                        <input
                                                            type="number"
                                                            value={slot.price}
                                                            onChange={e => handleSlotUpdateChange(index, 'price', e.target.value)}
                                                            style={{
                                                                width: '100%',
                                                                padding: '10px 12px 10px 24px',
                                                                background: theme.input,
                                                                border: `1px solid ${theme.inputBorder}`,
                                                                borderRadius: '8px',
                                                                color: theme.text,
                                                                fontSize: '13px',
                                                                outline: 'none',
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            DEFAULT_SLOTS.map(slot => (
                                                <div key={slot.name}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                        <label style={{ fontSize: '12px', fontWeight: 600, color: theme.textSecondary }}>{slot.name}</label>
                                                        <span style={{ fontSize: '10px', color: theme.textMuted }}>{slot.range}</span>
                                                    </div>
                                                    <div style={{ position: 'relative' }}>
                                                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.textMuted, fontSize: '13px' }}>₹</span>
                                                        <input
                                                            type="number"
                                                            value={slotPrices[slot.name]}
                                                            onChange={e => handleSlotPriceChange(slot.name, e.target.value)}
                                                            style={{
                                                                width: '100%',
                                                                padding: '10px 12px 10px 24px',
                                                                background: theme.input,
                                                                border: `1px solid ${theme.inputBorder}`,
                                                                borderRadius: '8px',
                                                                color: theme.text,
                                                                fontSize: '13px',
                                                                outline: 'none',
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <p style={{ marginTop: '12px', fontSize: '11px', color: theme.textMuted, fontStyle: 'italic' }}>* These four slots are standardized for this service and cannot be renamed.</p>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: theme.textSecondary, marginBottom: '8px' }}>Phone Number</label>
                                    <input
                                        type="text"
                                        value={formData.phoneNumber}
                                        onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            background: theme.input,
                                            border: `1px solid ${theme.inputBorder}`,
                                            borderRadius: '10px',
                                            color: theme.text,
                                            fontSize: '14px',
                                            outline: 'none'
                                        }}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '16px',
                                    background: 'rgba(99, 102, 241, 0.05)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(99, 102, 241, 0.1)'
                                }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: theme.text, marginBottom: '4px' }}>Advanced Booking (30 Days)</label>
                                        <p style={{ fontSize: '12px', color: theme.textSecondary, margin: 0 }}>Enable parents to book up to a month in advance.</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.advancedBookingEnabled}
                                        onChange={e => setFormData({ ...formData, advancedBookingEnabled: e.target.checked })}
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: theme.input,
                                        border: `1px solid ${theme.inputBorder}`,
                                        borderRadius: '10px',
                                        color: theme.text,
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        border: 'none',
                                        borderRadius: '10px',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {editingService ? 'Update Service' : 'Add Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
