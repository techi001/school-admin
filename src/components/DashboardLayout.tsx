import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme, getTheme } from '../context/ThemeContext';
import { schoolService } from '../services/schoolService';
import {
    LayoutDashboard,
    Building2,
    Calendar,
    LogOut,
    Menu,
    Moon,
    Sun,
    Settings
} from 'lucide-react';
import logoImage from '../assets/icon.png';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const theme = getTheme(isDark);
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    // School Branding State
    const [schoolName, setSchoolName] = useState('Special Nest');
    const [schoolLogo, setSchoolLogo] = useState(logoImage);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);

        // Initial check
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false); // Default closed on mobile
        }

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (user?.schoolId) {
            schoolService.getProfile(user.schoolId)
                .then(profile => {
                    if (profile.name) setSchoolName(profile.name);
                    if (profile.logoUrl) setSchoolLogo(profile.logoUrl);
                })
                .catch(err => console.error('Failed to load branding', err));
        }
    }, [user?.schoolId]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Building2, label: 'School Profile', path: '/school-profile' },
        { icon: Calendar, label: 'Manage Slots', path: '/manage-slots' },
        { icon: Settings, label: 'Account', path: '/account' },
    ];

    // Sidebar Width Logic
    // Desktop: Open = 280px, Closed = 70px (Mini Sidebar)
    // Mobile: Open = 280px, Closed = 0px (Hidden)
    const sidebarWidth = isMobile
        ? (isSidebarOpen ? '280px' : '0')
        : (isSidebarOpen ? '280px' : '88px');

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif",
            background: theme.bg
        }}>
            {/* Sidebar */}
            <aside style={{
                position: isMobile ? 'absolute' : 'relative',
                zIndex: 50,
                height: '100%',
                width: sidebarWidth,
                minWidth: sidebarWidth,
                background: isDark ? '#0f172a' : '#ffffff',
                borderRight: `1px solid ${theme.cardBorder}`,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden',
                boxShadow: isDark || (!isMobile && !isSidebarOpen) ? 'none' : '4px 0 20px rgba(0,0,0,0.05)'
            }}>
                {/* Logo Section */}
                <div style={{
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isSidebarOpen ? 'space-between' : 'center',
                    padding: isSidebarOpen ? '0 24px' : '0 10px',
                    borderBottom: `1px solid ${theme.cardBorder}`,
                    whiteSpace: 'nowrap'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                        <img src={schoolLogo} alt="Logo" style={{ minWidth: '40px', width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} />
                        <span style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            whiteSpace: 'nowrap',
                            opacity: isSidebarOpen ? 1 : 0,
                            transition: 'opacity 0.2s',
                            display: isSidebarOpen ? 'block' : 'none',
                            textOverflow: 'ellipsis',
                            maxWidth: '160px',
                            overflow: 'hidden'
                        }} title={schoolName}>{schoolName}</span>
                    </div>
                    {isSidebarOpen && !isMobile && (
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
                        >
                            <Menu style={{ width: '20px', height: '20px', color: theme.textMuted, transform: 'rotate(180deg)' }} />
                        </button>
                    )}
                </div>

                {/* Theme Toggle */}
                <div style={{ padding: '16px 16px 8px 16px', display: isSidebarOpen ? 'block' : 'flex', justifyContent: 'center' }}>
                    <button
                        onClick={toggleTheme}
                        title={isDark ? 'Light Mode' : 'Dark Mode'}
                        style={{
                            width: isSidebarOpen ? '100%' : '48px',
                            height: '42px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: isSidebarOpen ? '10px' : '0',
                            padding: '10px',
                            borderRadius: '12px',
                            border: `1px solid ${theme.cardBorder}`,
                            background: theme.card,
                            color: theme.textSecondary,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontSize: '13px',
                            fontWeight: 500
                        }}
                    >
                        {isDark ? <Sun style={{ width: '18px', height: '18px' }} /> : <Moon style={{ width: '18px', height: '18px' }} />}
                        {isSidebarOpen && (isDark ? 'Light Mode' : 'Dark Mode')}
                    </button>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '16px 16px', overflowY: 'auto', overflowX: 'hidden' }}>
                    {isSidebarOpen && (
                        <div style={{ marginBottom: '8px', padding: '0 12px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Menu
                            </span>
                        </div>
                    )}
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                title={!isSidebarOpen ? item.label : ''}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                                    gap: '12px',
                                    padding: '14px 16px',
                                    marginBottom: '4px',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease',
                                    background: isActive
                                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                        : 'transparent',
                                    color: isActive ? '#ffffff' : theme.textSecondary,
                                    boxShadow: isActive ? '0 4px 15px rgba(99, 102, 241, 0.3)' : 'none',
                                    width: isSidebarOpen ? '100%' : '48px',
                                    margin: isSidebarOpen ? '0' : '0 auto 4px'
                                }}
                            >
                                <item.icon style={{ minWidth: '20px', width: '20px', height: '20px' }} />
                                {isSidebarOpen && <span style={{ fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap' }}>{item.label}</span>}
                            </Link>
                        );
                    })}

                    {/* Divider */}
                    <div style={{ height: '1px', background: theme.cardBorder, margin: '12px 0' }} />

                    {/* Account Info */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                            gap: '12px',
                            padding: '14px 16px',
                            marginBottom: '4px',
                            borderRadius: '12px',
                            background: 'transparent',
                            color: theme.textSecondary,
                            width: isSidebarOpen ? '100%' : '48px',
                            margin: isSidebarOpen ? '0' : '0 auto 4px'
                        }}
                    >
                        <div style={{
                            minWidth: '36px',
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '14px'
                        }}>
                            {user?.name?.charAt(0).toUpperCase() || user?.mobileNumber?.charAt(0) || 'S'}
                        </div>
                        {isSidebarOpen && (
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: theme.text, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name || 'School Admin'}</div>
                                <div style={{ fontSize: '11px', color: theme.textMuted }}>School Admin</div>
                            </div>
                        )}
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        title={!isSidebarOpen ? 'Sign Out' : ''}
                        style={{
                            width: isSidebarOpen ? '100%' : '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                            gap: '12px',
                            padding: '14px 16px',
                            borderRadius: '12px',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 500,
                            textAlign: 'left',
                            margin: isSidebarOpen ? '0' : '0 auto'
                        }}
                    >
                        <LogOut style={{ minWidth: '20px', width: '20px', height: '20px' }} />
                        {isSidebarOpen && 'Sign Out'}
                    </button>
                </nav>
            </aside>

            {/* Overlay for mobile when sidebar is open */}
            {isMobile && isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 40
                    }}
                />
            )}

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Header (Visible on Desktop only to toggle if sidebar is mini? Or always? 
                   Actually, let's keep the header logic: Mobile Header is for Opening. 
                   On Desktop, we can have a toggle button in the sidebar itself (see above) 
                   OR a button in a desktop header. 
                   For now, the sidebar has a toggle button inside it for Desktop.
                   Mobile Header handles Mobile Opening.
                */}
                <header
                    style={{
                        height: '64px',
                        // Show header if Mobile OR if Sidebar is closed (to allow opening)
                        display: (isMobile || !isSidebarOpen) ? 'flex' : 'none',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 20px',
                        background: theme.card,
                        borderBottom: `1px solid ${theme.cardBorder}`,
                        backdropFilter: 'blur(20px)'
                    }}
                >
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
                    >
                        <Menu style={{ width: '24px', height: '24px', color: theme.text }} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={schoolLogo} alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                        <span style={{ fontWeight: 600, color: theme.text }}>{schoolName}</span>
                    </div>
                    <button
                        onClick={toggleTheme}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
                    >
                        {isDark ? <Sun style={{ width: '20px', height: '20px', color: theme.text }} /> : <Moon style={{ width: '20px', height: '20px', color: theme.text }} />}
                    </button>
                </header>

                {/* Desktop Toggle Button (optional, if we want one outside sidebar when sidebar is collapsed? 
                    But we made sidebar 88px, so we can keep toggle inside).
                    Let's add a floating toggle or header toggle for Desktop if sidebar is collapsed?
                    Actually, we put the toggle inside the mini sidebar (top section).
                    So we don't need an external toggle for desktop.
                */}

                <main style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: '32px 40px',
                    background: theme.bg,
                    position: 'relative'
                }}>
                    {/* Add a desktop toggle button if sidebar is collapsed, nicely integrated?
                        Or just rely on the one in the sidebar. 
                        Button in sidebar is fine.
                    */}
                    {!isMobile && !isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            style={{
                                position: 'absolute',
                                top: '24px',
                                left: '14px', // Aligned with mini sidebar center? No, inside main content?
                                // Actually, if sidebar is 88px, the button inside sidebar works.
                                // But if sidebar is collapsed, we need a way to open it.
                                // We added a button in the logo section of sidebar? Yes.
                                // In 'Logo Section', we rendered button only if (isSidebarOpen && !isMobile).
                                // Make sure we render a Open button if (!isSidebarOpen).
                                display: 'none'
                            }}
                        >
                            Open
                        </button>
                    )}

                    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
