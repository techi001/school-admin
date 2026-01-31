import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Layout, Tabs, Form, Select, DatePicker, Switch, Input, Button, ConfigProvider, Typography, Card, Row, Col, Space, Tag, Table, Alert, message, Radio, Modal, Tooltip, theme as antTheme } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CalendarOutlined, EditOutlined, StopOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { schoolService } from '../services/schoolService';
import { useAuth } from '../context/AuthContext';
import { useTheme, getTheme } from '../context/ThemeContext';
import dayjs from 'dayjs';


const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

// --- Main Component ---

const ManageSlots: React.FC = () => {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const appTheme = getTheme(isDark);
    const schoolId = user?.schoolId;

    // Tab State
    const [activeTab, setActiveTab] = useState('1');

    // Services
    const [services, setServices] = useState<any[]>([]);

    useEffect(() => {
        if (schoolId) {
            fetchServices();
        }
    }, [schoolId]);

    const fetchServices = async () => {
        try {
            const data = await schoolService.getServices(schoolId!);
            setServices(data || []);
        } catch (error) {
            message.error('Failed to load services');
        }
    };

    // --- Dynamic Styles ---
    const glassStyle = {
        background: appTheme.card,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${appTheme.cardBorder}`,
        boxShadow: isDark ? '0 8px 32px 0 rgba(0, 0, 0, 0.3)' : '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
        borderRadius: '16px',
        padding: '32px',
    };

    const cardStyle = {
        background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff',
        borderRadius: '12px',
        boxShadow: isDark ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.03)',
        border: `1px solid ${appTheme.cardBorder}`,
        overflow: 'hidden',
    };

    // --- Create Schedule Content ---
    const CreateScheduleContent = () => {
        const [form] = Form.useForm();
        const [daysEnabled, setDaysEnabled] = useState([true, true, true, true, true, false, false]);
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const [loading, setLoading] = useState(false);
        const [dates, setDates] = useState<any>(null);
        const [hackValue, setHackValue] = useState<any>(null);

        const disabledDate = (current: dayjs.Dayjs) => {
            if (!dates) {
                return false;
            }
            const tooLate = dates[0] && current.diff(dates[0], 'days') > 29;
            const tooEarly = dates[0] && dates[0].diff(current, 'days') > 29;
            return !!tooEarly || !!tooLate;
        };

        const onOpenChange = (open: boolean) => {
            if (open) {
                setDates(null);
                setHackValue(null);
            }
        };

        // Pre-fill static rows for MVP
        const [slotRows, setSlotRows] = useState([
            { timeLabel: '9:00 AM - 12:00 PM', capacity: 15, start: '09:00', end: '12:00' },
            { timeLabel: '12:00 PM - 3:00 PM', capacity: 15, start: '12:00', end: '15:00' },
            { timeLabel: '3:00 PM - 6:00 PM', capacity: 15, start: '15:00', end: '18:00' },
            { timeLabel: '6:00 PM - 9:00 PM', capacity: 15, start: '18:00', end: '21:00' },
        ]);

        const handleCapacityChange = (idx: number, val: string) => {
            const newRows = [...slotRows];
            newRows[idx].capacity = parseInt(val) || 0;
            setSlotRows(newRows);
        };

        const onFinish = async (values: any) => {
            if (!schoolId) return;
            setLoading(true);
            try {
                const { serviceId, dateRange } = values;
                const fromDate = dateRange[0].format('YYYY-MM-DD');
                const endDate = dateRange[1].format('YYYY-MM-DD');
                const activeWeekdays = days.filter((_, idx) => daysEnabled[idx]);

                if (activeWeekdays.length === 0) {
                    Swal.fire({
                        title: 'Selection Required',
                        text: 'Please select at least one weekday to create a schedule.',
                        icon: 'warning',
                        confirmButtonColor: '#1890ff'
                    });
                    setLoading(false);
                    return;
                }

                // Create slots for each row using the new backend capability
                // The backend now creates ONE slot definition which applies to the range and weekdays.
                // We loop through our 'Rows' (Time Slots) and create a definition for each.

                const promises = slotRows.map(row => {
                    if (row.capacity > 0) {
                        return schoolService.createSlot(schoolId, {
                            serviceId,
                            slotName: row.timeLabel, // Or generate name
                            startTime: row.start,
                            endTime: row.end,
                            capacity: row.capacity,
                            isActive: true,
                            fromDate,
                            endDate,
                            weekdays: activeWeekdays
                        });
                    }
                    return Promise.resolve();
                });

                await Promise.all(promises);
                Swal.fire({
                    title: 'Schedule Created!',
                    text: 'The new schedule slots have been successfully created.',
                    icon: 'success',
                    confirmButtonColor: '#10b981'
                });
                form.resetFields();
            } catch (err: any) {
                console.error(err);
                Swal.fire({
                    title: 'Creation Failed',
                    text: err.response?.data?.message || 'Failed to create slots. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#ef4444'
                });
            } finally {
                setLoading(false);
            }
        };

        return (
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <Title level={3} style={{ marginBottom: 8, color: appTheme.text }}>
                        Create New Schedule
                    </Title>
                    <Paragraph style={{ color: appTheme.textSecondary }}>Define capacity and availability for a date range.</Paragraph>
                </div>

                <Form layout="vertical" size="large" form={form} onFinish={onFinish}>
                    <Card style={cardStyle} bodyStyle={{ padding: 32 }}>
                        <Row gutter={[24, 24]}>
                            <Col xs={24} md={12}>
                                <Form.Item label={<span style={{ color: appTheme.text }}>Select Service</span>} name="serviceId" rules={[{ required: true, message: 'Please select a service' }]}>
                                    <Select placeholder="Choose Service" style={{ width: '100%' }}>
                                        {services.map(s => (
                                            <Option key={s.id} value={s.id}>{s.name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label={<span style={{ color: appTheme.text }}>Date Range</span>} name="dateRange" rules={[{ required: true, message: 'Please select dates' }]}>
                                    <RangePicker
                                        style={{ width: '100%' }}
                                        format="DD/MM/YYYY"
                                        placeholder={['Start Date', 'End Date']}
                                        value={hackValue || undefined}
                                        disabledDate={disabledDate}
                                        onCalendarChange={(val: any) => setDates(val)}
                                        onChange={(val: any) => setHackValue(val)}
                                        onOpenChange={onOpenChange}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <div style={{ marginTop: 16 }}>
                            <Text strong style={{ display: 'block', marginBottom: 16, color: appTheme.text }}>Repeats On</Text>
                            <Space size="middle" wrap style={{ justifyContent: 'center', display: 'flex', background: isDark ? 'rgba(255,255,255,0.05)' : '#fafafa', padding: '16px', borderRadius: '12px' }}>
                                {days.map((day, index) => (
                                    <div key={day} style={{ textAlign: 'center' }}>
                                        <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500, color: daysEnabled[index] ? '#1890ff' : appTheme.textMuted }}>{day}</div>
                                        <Switch
                                            size="small"
                                            checked={daysEnabled[index]}
                                            onChange={(checked) => {
                                                const newDays = [...daysEnabled];
                                                newDays[index] = checked;
                                                setDaysEnabled(newDays);
                                            }}
                                        />
                                    </div>
                                ))}
                            </Space>
                        </div>
                    </Card>

                    <Card style={{ ...cardStyle, marginTop: 24 }} bodyStyle={{ padding: 32 }}>
                        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
                            <ClockCircleOutlined style={{ fontSize: 20, color: '#1890ff', marginRight: 12 }} />
                            <div>
                                <Text strong style={{ fontSize: 16, color: appTheme.text }}>Define Slot Capacities</Text>
                                <div style={{ fontSize: 12, color: appTheme.textMuted }}>Capacity applies to all selected days</div>
                            </div>
                        </div>

                        {slotRows.map((row, idx) => (
                            <Row key={idx} gutter={[16, 16]} align="middle" style={{ marginBottom: 16, padding: '16px', background: isDark ? 'rgba(255,255,255,0.02)' : '#f9f9f9', borderRadius: '8px', border: `1px solid ${appTheme.cardBorder}` }}>
                                <Col xs={14} md={16}>
                                    <Text strong style={{ color: appTheme.text }}>{row.timeLabel}</Text>
                                </Col>
                                <Col xs={10} md={8}>
                                    <Input
                                        type="number"
                                        value={row.capacity}
                                        onChange={(e) => handleCapacityChange(idx, e.target.value)}
                                        suffix={<span style={{ color: appTheme.textMuted, fontSize: 12 }}>seats</span>}
                                        style={{ textAlign: 'center', borderRadius: '6px' }}
                                    />
                                </Col>
                            </Row>
                        ))}
                    </Card>

                    <div style={{ marginTop: 32, textAlign: 'center' }}>
                        <Button type="primary" size="large" htmlType="submit" loading={loading} icon={<CheckCircleOutlined />} style={{ minWidth: 200, height: 50, borderRadius: 25, boxShadow: '0 4px 14px rgba(24, 144, 255, 0.3)' }}>
                            Publish Schedule
                        </Button>
                    </div>
                </Form>
            </div>
        );
    }

    // --- Block Date Content ---
    const BlockDateContent = () => {
        const [form] = Form.useForm();
        const [loading, setLoading] = useState(false);

        const onFinish = async (values: any) => {
            setLoading(true);
            try {
                const { date, serviceId, reason } = values;
                await schoolService.blockDate(
                    schoolId!,
                    serviceId,
                    date.format('YYYY-MM-DD'),
                    reason
                );
                Swal.fire({
                    title: 'Date Blocked',
                    text: 'The date has been successfully blocked.',
                    icon: 'success',
                    confirmButtonColor: '#10b981'
                });
                form.resetFields();
            } catch (err: any) {
                Swal.fire({
                    title: 'Block Failed',
                    text: err.response?.data?.message || 'Failed to block date.',
                    icon: 'error',
                    confirmButtonColor: '#ef4444'
                });
            } finally {
                setLoading(false);
            }
        };

        return (
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <Title level={3} style={{ marginBottom: 8, color: appTheme.text }}>
                        Block Date
                    </Title>
                    <Paragraph style={{ color: appTheme.textSecondary }}>Prevent bookings for a specific date (e.g., Holiday, Maintenance).</Paragraph>
                </div>

                <Card style={cardStyle} bodyStyle={{ padding: 32 }}>
                    <Form layout="vertical" size="large" form={form} onFinish={onFinish}>
                        <Form.Item label={<span style={{ color: appTheme.text }}>Select Date</span>} name="date" rules={[{ required: true, message: 'Please select a date' }]}>
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>

                        <Form.Item label={<span style={{ color: appTheme.text }}>Service (Optional)</span>} name="serviceId" help={<span style={{ fontSize: 12 }}>Leave empty to block for ALL services</span>}>
                            <Select placeholder="All Services" allowClear>
                                {services.map(s => (
                                    <Option key={s.id} value={s.id}>{s.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item label={<span style={{ color: appTheme.text }}>Reason (Optional)</span>} name="reason">
                            <TextArea rows={3} placeholder="e.g. Public Holiday" />
                        </Form.Item>

                        <div style={{ marginTop: 24 }}>
                            <Button type="primary" danger size="large" htmlType="submit" loading={loading} icon={<PauseCircleOutlined />} block style={{ borderRadius: 8, height: 48 }}>
                                Block Date
                            </Button>
                        </div>
                    </Form>
                </Card>
            </div>
        );
    };
    const EditScheduleContent = () => {
        // Use RangePicker state instead of single date
        const [dateRange, setDateRange] = useState<any>(null);
        const [dateMode, setDateMode] = useState<'single' | 'range'>('range');
        const [selectedEditService, setSelectedEditService] = useState<string | null>(null);
        const [slots, setSlots] = useState<any[]>([]);
        const [loading, setLoading] = useState(false);
        const [updating, setUpdating] = useState(false);
        const [editDates, setEditDates] = useState<any>(null); // For disabledDate logic
        const [hackValue, setHackValue] = useState<any>(null);

        // Edit Availability Modal State
        const [isEditAvailModalOpen, setIsEditAvailModalOpen] = useState(false);
        const [editingAvailSlot, setEditingAvailSlot] = useState<any>(null);
        const [newAvailCapacity, setNewAvailCapacity] = useState<number>(0);

        // 30-day limit logic (same as create)
        const disabledDate = (current: dayjs.Dayjs) => {
            // Disable past dates
            if (current && current < dayjs().startOf('day')) {
                return true;
            }
            if (!editDates) return false;
            const tooLate = editDates[0] && current.diff(editDates[0], 'days') > 29;
            const tooEarly = editDates[0] && editDates[0].diff(current, 'days') > 29;
            return !!tooEarly || !!tooLate;
        };

        const onOpenChange = (open: boolean) => {
            if (open) {
                setEditDates(null);
                setHackValue(null);
            }
        };

        const fetchAvailability = async () => {
            if (!dateRange || !selectedEditService) return;
            setLoading(true);
            try {
                // Fetch availability for the START date just to get the slot structure
                // We'll trust the structure is consistent across days for this service
                const startDateStr = dateRange[0].format('YYYY-MM-DD');

                // We use getSlotAvailability to get the structure (slots definitions)
                const data = await schoolService.getSlotAvailability(schoolId!, startDateStr, parseInt(selectedEditService));

                const uniqueMap = new Map();
                data.forEach((s: any) => {
                    const key = `${s.startTime}-${s.endTime}`;
                    if (!uniqueMap.has(key)) {
                        uniqueMap.set(key, {
                            ...s,
                            ids: [s.id],
                            key: s.id, // Use first ID as unique key for UI
                            newCapacity: s.currentCapacity,
                            addCapacity: 0
                        });
                    } else {
                        uniqueMap.get(key).ids.push(s.id);
                    }
                });

                setSlots(Array.from(uniqueMap.values()));
            } catch (err) {
                message.error('Failed to fetch slots info');
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            if (dateRange && selectedEditService) {
                fetchAvailability();
            } else {
                setSlots([]);
            }
        }, [dateRange, selectedEditService]);



        const handleSlotUpdate = async (slot: any, newCapacity: number) => {
            if (!dateRange) return;
            setUpdating(true);
            try {
                // Fix: Pass arguments correctly (schoolId, date, updates, options)
                await schoolService.updateSlotAvailability(
                    schoolId!,
                    '', // Empty date string since we use range options
                    [{
                        slotId: slot.id,
                        newCapacity: newCapacity
                    }],
                    {
                        fromDate: dateRange[0].format('YYYY-MM-DD'),
                        endDate: dateRange[1].format('YYYY-MM-DD')
                    }
                );
                message.success('Slot updated successfully');
                fetchAvailability();
            } catch (error: any) {
                // Improve error message display
                const msg = error.response?.data?.message || error.message || 'Failed to update slot';
                message.error(msg);
            } finally {
                setUpdating(false);
            }
        };

        const handleEditAvailabilitySave = async () => {
            if (!dateRange || !editingAvailSlot) return;
            setUpdating(true);
            try {
                await schoolService.updateSlotAvailability(
                    schoolId!,
                    '',
                    [{
                        slotId: editingAvailSlot.id,
                        newCapacity: newAvailCapacity
                    }],
                    {
                        fromDate: dateRange[0].format('YYYY-MM-DD'),
                        endDate: dateRange[1].format('YYYY-MM-DD')
                    }
                );
                message.success('Slot capacity updated successfully');
                setIsEditAvailModalOpen(false);
                setEditingAvailSlot(null);
                fetchAvailability();
            } catch (error: any) {
                const msg = error.response?.data?.message || error.message || 'Failed to update slot';
                message.error(msg);
            } finally {
                setUpdating(false);
            }
        };

        const columns = [
            {
                title: 'Time',
                dataIndex: 'startTime',
                key: 'startTime',
                render: (_: any, r: any) => (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text strong style={{ color: appTheme.text }}>{r.slotName}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{r.startTime} - {r.endTime}</Text>
                    </div>
                )
            },
            {
                title: 'Availability',
                key: 'availability',
                render: (_: any, r: any) => (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text style={{ color: r.currentCapacity === 0 ? '#ff4d4f' : appTheme.text }}>
                            {r.currentCapacity === 0 ? 'Cancelled' : `${r.available} / ${r.currentCapacity} Seats`}
                        </Text>
                        {r.bookedCount > 0 && <Text type="secondary" style={{ fontSize: 11 }}>{r.bookedCount} Booked</Text>}
                    </div>
                )
            },
            {
                title: 'Action',
                key: 'action',
                render: (_: any, r: any) => {
                    const hasBookings = r.bookedCount > 0;
                    const isCancelled = r.currentCapacity === 0;

                    if (isCancelled) return <Tag color="error">Cancelled</Tag>;

                    return (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <Tooltip title="Edit Capacity">
                                <Button
                                    type="default"
                                    size="small"
                                    onClick={() => {
                                        setEditingAvailSlot(r);
                                        setNewAvailCapacity(r.currentCapacity);
                                        setIsEditAvailModalOpen(true);
                                    }}
                                    icon={<EditOutlined />}
                                >
                                    Edit
                                </Button>
                            </Tooltip>
                            <Tooltip title={hasBookings ? `Cannot cancel: ${r.bookedCount} active bookings` : "Cancel this slot (Set capacity to 0)"}>
                                <Button
                                    danger
                                    type="primary"
                                    size="small"
                                    disabled={hasBookings}
                                    onClick={() => handleSlotUpdate(r, 0)}
                                    icon={<StopOutlined />}
                                >
                                    Cancel Slot
                                </Button>
                            </Tooltip>
                        </div>
                    );
                }
            }
        ];

        return (
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                <Card style={cardStyle} bodyStyle={{ padding: 24 }}>
                    <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                        <Col xs={24} md={8}>
                            <Text strong style={{ color: appTheme.text }}>Select Service</Text>
                            <Select style={{ width: '100%', marginTop: 8 }} onChange={setSelectedEditService} value={selectedEditService} placeholder="Select Service">
                                {services.map(s => <Option key={s.id} value={s.id.toString()}>{s.name}</Option>)}
                            </Select>
                        </Col>
                        <Col xs={24} md={8}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Text strong style={{ color: appTheme.text }}>
                                    {dateMode === 'range' ? 'Select Range' : 'Select Date'}
                                </Text>
                                <Radio.Group
                                    value={dateMode}
                                    onChange={e => {
                                        setDateMode(e.target.value);
                                        setDateRange(null);
                                        setHackValue(null);
                                        setEditDates(null);
                                    }}
                                    size="small"
                                    buttonStyle="solid"
                                >
                                    <Radio.Button value="range">Range</Radio.Button>
                                    <Radio.Button value="single">Single</Radio.Button>
                                </Radio.Group>
                            </div>

                            {dateMode === 'range' ? (
                                <RangePicker
                                    style={{ width: '100%', marginTop: 8 }}
                                    format="DD/MM/YYYY"
                                    value={hackValue || undefined}
                                    disabledDate={disabledDate}
                                    onCalendarChange={(val: any) => setEditDates(val)}
                                    onChange={(val: any) => {
                                        setHackValue(val);
                                        setDateRange(val);
                                    }}
                                    onOpenChange={onOpenChange}
                                />
                            ) : (
                                <DatePicker
                                    style={{ width: '100%', marginTop: 8 }}
                                    format="DD/MM/YYYY"
                                    value={hackValue ? hackValue[0] : null}
                                    onChange={(val: any) => {
                                        setHackValue(val ? [val, val] : null);
                                        setDateRange(val ? [val, val] : null);
                                    }}
                                />
                            )}
                        </Col>
                    </Row>


                    {/* Replaced Bulk Actions with Per-Slot Actions */}
                    <div style={{ marginBottom: 16 }}>
                        <Alert type="info" message="Select a date/range to view slots. Use 'Cancel Slot' to remove availability if no bookings exist." showIcon />
                    </div>

                    {dateRange && selectedEditService ? (
                        <>
                            <Table
                                loading={loading}
                                dataSource={slots}
                                columns={columns}
                                pagination={false}
                                bordered={false}
                                rowKey="id"
                                scroll={{ x: 600 }}
                                style={{ background: 'transparent' }}
                            />
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: appTheme.textMuted }}>
                            <CalendarOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                            <p>Select a date range and service to manage availability</p>
                        </div>
                    )}
                </Card>

                <Modal
                    title="Edit Slot Capacity"
                    open={isEditAvailModalOpen}
                    onOk={handleEditAvailabilitySave}
                    onCancel={() => setIsEditAvailModalOpen(false)}
                    confirmLoading={updating}
                >
                    {editingAvailSlot && (
                        <div>
                            <p><strong>Slot:</strong> {editingAvailSlot.slotName} ({editingAvailSlot.startTime} - {editingAvailSlot.endTime})</p>
                            <p><strong>Current Capacity:</strong> {editingAvailSlot.currentCapacity}</p>
                            {editingAvailSlot.bookedCount > 0 && (
                                <Alert type="warning" showIcon message={`This slot has ${editingAvailSlot.bookedCount} active bookings. You cannot reduce capacity below this number.`} style={{ marginBottom: 16 }} />
                            )}
                            <Form layout="vertical">
                                <Form.Item label="New Capacity">
                                    <Input
                                        type="number"
                                        value={newAvailCapacity}
                                        onChange={(e) => setNewAvailCapacity(parseInt(e.target.value) || 0)}
                                        min={editingAvailSlot.bookedCount}
                                    />
                                </Form.Item>
                            </Form>
                        </div>
                    )}
                </Modal>
            </div>
        );
    };

    // --- View Schedule Content ---
    const ViewScheduleContent = () => {
        const [viewService, setViewService] = useState<string>('');
        const [scheduleSlots, setScheduleSlots] = useState<any[]>([]);
        const [loading, setLoading] = useState(false);

        useEffect(() => {
            if (activeTab === '3') {
                fetchSchedule();
            }
        }, [activeTab, viewService]);

        const [editingSlot, setEditingSlot] = useState<any>(null);
        const [isEditModalOpen, setIsEditModalOpen] = useState(false);
        const [updateLoading, setUpdateLoading] = useState(false);

        const handleEditSlot = (slot: any) => {
            setEditingSlot({ ...slot });
            setIsEditModalOpen(true);
        };

        const handleUpdateSlot = async () => {
            if (!editingSlot) return;
            setUpdateLoading(true);
            try {
                await schoolService.updateSlot(editingSlot.id, {
                    capacity: editingSlot.capacity,
                    isActive: editingSlot.isActive
                });
                message.success('Slot updated successfully');
                setIsEditModalOpen(false);
                setEditingSlot(null);
                fetchSchedule(); // Refresh list
            } catch (error) {
                message.error('Failed to update slot');
            } finally {
                setUpdateLoading(false);
            }
        };

        const fetchSchedule = async () => {
            // For "View Schedule", we show all created slots. 
            // We can use getSlots API.
            setLoading(true);
            try {
                const serviceId = viewService ? parseInt(viewService) : undefined;
                const data = await schoolService.getSlots(schoolId!, serviceId, 1, 100);
                setScheduleSlots(data.slots || []);
            } catch (error) {
                message.error('Failed to fetch schedule');
            } finally {
                setLoading(false);
            }
        };

        const columns = [
            {
                title: 'Slot Name',
                dataIndex: 'slotName',
                key: 'slotName',
                render: (text: string) => <Text strong style={{ color: appTheme.text }}>{text}</Text>
            },
            {
                title: 'Time',
                key: 'time',
                render: (_: any, r: any) => <Tag color="cyan">{r.startTime} - {r.endTime}</Tag>
            },
            {
                title: 'Service',
                key: 'service',
                render: (_: any, r: any) => {
                    const service = services.find(s => s.id === r.serviceId);
                    return <Tag color="blue">{service ? service.name : 'Unknown'}</Tag>;
                }
            },
            {
                title: 'Validity',
                key: 'validity',
                render: (_: any, r: any) => (
                    <Space direction="vertical" size={2}>
                        {r.fromDate && r.endDate ? (
                            <Text style={{ fontSize: 12, color: appTheme.textSecondary }}>
                                {dayjs(r.fromDate).format('DD MMM')} - {dayjs(r.endDate).format('DD MMM YYYY')}
                            </Text>
                        ) : <Text style={{ color: appTheme.textSecondary }}>Always Valid</Text>}
                        <div>
                            {r.weekdays && r.weekdays.map((d: string) => <Tag key={d} style={{ fontSize: 10, marginRight: 4 }}>{d}</Tag>)}
                        </div>
                    </Space>
                )
            },
            {
                title: 'Capacity',
                dataIndex: 'capacity',
                key: 'capacity',
                render: (text: any) => <span style={{ color: appTheme.text }}>{text}</span>
            },
            {
                title: 'Status',
                dataIndex: 'isActive',
                key: 'isActive',
                render: (active: boolean) => active ? <Tag color="success">Active</Tag> : <Tag>Inactive</Tag>
            },
            {
                title: 'Action',
                key: 'action',
                render: (_: any, r: any) => (
                    <Button type="text" icon={<EditOutlined />} onClick={() => handleEditSlot(r)} />
                )
            }
        ];

        return (
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                <Card style={cardStyle} bodyStyle={{ padding: 24 }}>
                    <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                            <Title level={4} style={{ margin: 0, color: appTheme.text }}>All Scheduled Slots</Title>
                            <Select style={{ width: 200, maxWidth: '100%' }} value={viewService} onChange={setViewService} placeholder="Filter by Service">
                                <Option value="">All Services</Option>
                                {services.map(s => <Option key={s.id} value={s.id.toString()}>{s.name}</Option>)}
                            </Select>
                        </div>
                    </div>
                    <Table
                        loading={loading}
                        dataSource={scheduleSlots}
                        columns={columns}
                        rowKey="id"
                        bordered={false}
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 800 }}
                        style={{ background: 'transparent' }}
                    />
                </Card>

                <Modal
                    title="Edit Master Slot"
                    open={isEditModalOpen}
                    onOk={handleUpdateSlot}
                    onCancel={() => setIsEditModalOpen(false)}
                    confirmLoading={updateLoading}
                >
                    {editingSlot && (
                        <Form layout="vertical">
                            <Form.Item label="Slot Name">
                                <Input value={editingSlot.slotName} disabled />
                            </Form.Item>
                            <Form.Item label="Base Capacity">
                                <Input
                                    type="number"
                                    value={editingSlot.capacity}
                                    onChange={(e) => setEditingSlot({ ...editingSlot, capacity: parseInt(e.target.value) || 0 })}
                                />
                            </Form.Item>
                            <Form.Item label="Status">
                                <Switch
                                    checked={editingSlot.isActive}
                                    onChange={(checked) => setEditingSlot({ ...editingSlot, isActive: checked })}
                                />
                                <span style={{ marginLeft: 8 }}>{editingSlot.isActive ? 'Active' : 'Inactive'}</span>
                            </Form.Item>
                        </Form>
                    )}
                </Modal>
            </div>
        );
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
                token: {
                    colorPrimary: '#1890ff',
                    borderRadius: 8,
                    fontFamily: "'Inter', sans-serif",
                    colorBgContainer: isDark ? 'rgba(30, 41, 59, 1)' : '#ffffff',
                },
                components: {
                    Card: {
                        colorBgContainer: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff',
                    },
                    Tabs: {
                        itemSelectedColor: '#1890ff',
                        itemHoverColor: '#40a9ff',
                        itemColor: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)',
                        titleFontSizeLG: 16,
                        inkBarColor: '#1890ff',
                        itemActiveColor: '#096dd9',
                    }
                }
            }}
        >
            <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
                <Content style={{ padding: '0px' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                        <div style={{ marginBottom: 32 }}>
                            <Title level={2} style={{ marginBottom: 8, color: appTheme.text }}>Manage Schedule</Title>
                            <Text style={{ color: appTheme.textSecondary }}>Create, edit, and view availability slots for your services.</Text>
                        </div>

                        <div style={glassStyle}>
                            <Tabs
                                activeKey={activeTab}
                                onChange={setActiveTab}
                                type="line"
                                size="large"
                                tabBarStyle={{ marginBottom: 32, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}` }}
                                items={[
                                    {
                                        key: '1',
                                        label: 'Create Schedule',
                                        children: <CreateScheduleContent />,
                                    },
                                    {
                                        key: '2',
                                        label: 'Edit Availability',
                                        children: <EditScheduleContent />,
                                    },
                                    {
                                        key: '3',
                                        label: 'View All Slots',
                                        children: <ViewScheduleContent />,
                                    },
                                    {
                                        key: '4',
                                        label: 'Block Dates',
                                        children: <BlockDateContent />,
                                    },
                                ]}
                            />
                        </div>

                    </div>
                </Content>
            </Layout>
        </ConfigProvider>
    );
};

export default ManageSlots;
