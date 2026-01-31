import { useState, useEffect } from 'react';
import { useTheme, getTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { User, Mail, Phone, Lock, Save, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Account() {
    const { isDark } = useTheme();
    const theme = getTheme(isDark);
    const { user } = useAuth(); // We might need a way to update user in context, login forces update but is hacky. Better to just update local state or have a specific update method in context. For now, relying on local state for display.

    // Form States
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI States
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [isLoadingPassword, setIsLoadingPassword] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

    // Password Visibility States
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoadingProfile(true);
        try {
            await authService.updateProfile({ name, email });
            Swal.fire({
                icon: 'success',
                title: 'Profile Updated',
                text: 'Your profile details have been updated successfully.',
                background: theme.card,
                color: theme.text,
                confirmButtonColor: '#6366f1'
            });
            // Ideally update context here, but reloading page or refetching profile works too
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: error.message || 'Failed to update profile',
                background: theme.card,
                color: theme.text,
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Password Mismatch',
                text: 'New password and confirmation do not match.',
                background: theme.card,
                color: theme.text
            });
            return;
        }

        if (newPassword.length < 6) {
            Swal.fire({
                icon: 'error',
                title: 'Weak Password',
                text: 'Password must be at least 6 characters long.',
                background: theme.card,
                color: theme.text
            });
            return;
        }

        setIsLoadingPassword(true);
        try {
            await authService.resetPassword({ newPassword }, currentPassword);
            Swal.fire({
                icon: 'success',
                title: 'Password Changed',
                text: 'Your password has been updated successfully. Please login again.',
                background: theme.card,
                color: theme.text,
                confirmButtonColor: '#6366f1'
            }).then(() => {
                authService.logout();
            });
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Change Failed',
                text: error.message || 'Failed to change password',
                background: theme.card,
                color: theme.text,
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsLoadingPassword(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <div style={{ paddingBottom: '40px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: theme.text, marginBottom: '8px' }}>Account Settings</h1>
                <p style={{ color: theme.textSecondary }}>Manage your profile information and security settings</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 3fr', gap: '32px' }}>
                {/* Sidebar Navigation for Settings */}
                <div style={{}}>
                    <div style={{
                        background: theme.card,
                        borderRadius: '20px',
                        border: `1px solid ${theme.cardBorder}`,
                        overflow: 'hidden',
                        position: 'sticky',
                        top: '24px'
                    }}>
                        <button
                            onClick={() => setActiveTab('profile')}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '16px 24px',
                                background: activeTab === 'profile' ? (isDark ? 'rgba(99, 102, 241, 0.1)' : '#f5f3ff') : 'transparent',
                                border: 'none',
                                borderLeft: `4px solid ${activeTab === 'profile' ? '#6366f1' : 'transparent'}`,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <User size={20} color={activeTab === 'profile' ? '#6366f1' : theme.textSecondary} />
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ margin: 0, fontWeight: 600, color: activeTab === 'profile' ? '#6366f1' : theme.text, fontSize: '15px' }}>Profile Information</p>
                                <p style={{ margin: 0, fontSize: '12px', color: theme.textMuted }}>Name, Email, Role</p>
                            </div>
                        </button>
                        <div style={{ height: '1px', background: theme.cardBorder }} />
                        <button
                            onClick={() => setActiveTab('security')}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '16px 24px',
                                background: activeTab === 'security' ? (isDark ? 'rgba(99, 102, 241, 0.1)' : '#f5f3ff') : 'transparent',
                                border: 'none',
                                borderLeft: `4px solid ${activeTab === 'security' ? '#6366f1' : 'transparent'}`,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Lock size={20} color={activeTab === 'security' ? '#6366f1' : theme.textSecondary} />
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ margin: 0, fontWeight: 600, color: activeTab === 'security' ? '#6366f1' : theme.text, fontSize: '15px' }}>Security</p>
                                <p style={{ margin: 0, fontSize: '12px', color: theme.textMuted }}>Password, Authentication</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div>
                    {activeTab === 'profile' && (
                        <div style={{
                            background: theme.card,
                            borderRadius: '24px',
                            border: `1px solid ${theme.cardBorder}`,
                            padding: '32px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', paddingBottom: '24px', borderBottom: `1px solid ${theme.cardBorder}` }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '32px',
                                    fontWeight: 700,
                                    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)'
                                }}>
                                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: theme.text, margin: '0 0 4px 0' }}>{user?.name}</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            background: isDark ? 'rgba(99, 102, 241, 0.2)' : '#e0e7ff',
                                            color: '#6366f1',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            textTransform: 'uppercase'
                                        }}>
                                            {user?.role?.replace('_', ' ') || 'Admin'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: theme.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Full Name</label>
                                        <div style={{ position: 'relative' }}>
                                            <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: theme.textSecondary }} />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px 12px 48px',
                                                    borderRadius: '12px',
                                                    border: `1px solid ${theme.inputBorder}`,
                                                    background: theme.input,
                                                    color: theme.text,
                                                    fontSize: '15px',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: theme.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Email Address</label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: theme.textSecondary }} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px 12px 48px',
                                                    borderRadius: '12px',
                                                    border: `1px solid ${theme.inputBorder}`,
                                                    background: theme.input,
                                                    color: theme.text,
                                                    fontSize: '15px',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: theme.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Mobile Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: theme.textSecondary }} />
                                        <input
                                            type="text"
                                            value={user?.mobileNumber || ''}
                                            disabled
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px 12px 48px',
                                                borderRadius: '12px',
                                                border: `1px solid ${theme.inputBorder}`,
                                                background: isDark ? '#1e293b' : '#f8fafc',
                                                color: theme.textMuted,
                                                fontSize: '15px',
                                                outline: 'none',
                                                cursor: 'not-allowed'
                                            }}
                                        />
                                        <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: theme.textMuted }}>(Cannot be changed)</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                    <button
                                        type="submit"
                                        disabled={isLoadingProfile}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '12px 24px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                            color: 'white',
                                            fontSize: '15px',
                                            fontWeight: 600,
                                            cursor: isLoadingProfile ? 'not-allowed' : 'pointer',
                                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                                            opacity: isLoadingProfile ? 0.7 : 1
                                        }}
                                    >
                                        <Save size={18} />
                                        {isLoadingProfile ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>

                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div style={{
                            background: theme.card,
                            borderRadius: '24px',
                            border: `1px solid ${theme.cardBorder}`,
                            padding: '32px'
                        }}>
                            <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: `1px solid ${theme.cardBorder}` }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 700, color: theme.text, marginBottom: '8px' }}>Change Password</h2>
                                <p style={{ color: theme.textSecondary, fontSize: '14px' }}>Ensure your account is secure by using a strong password.</p>
                            </div>

                            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '500px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: theme.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Current Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: theme.textSecondary }} />
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px 48px 12px 48px',
                                                borderRadius: '12px',
                                                border: `1px solid ${theme.inputBorder}`,
                                                background: theme.input,
                                                color: theme.text,
                                                fontSize: '15px',
                                                outline: 'none'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '16px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: theme.textSecondary,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: 0
                                            }}
                                        >
                                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: theme.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: theme.textSecondary }} />
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            style={{
                                                width: '100%',
                                                padding: '12px 48px 12px 48px',
                                                borderRadius: '12px',
                                                border: `1px solid ${theme.inputBorder}`,
                                                background: theme.input,
                                                color: theme.text,
                                                fontSize: '15px',
                                                outline: 'none'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '16px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: theme.textSecondary,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: 0
                                            }}
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: theme.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Confirm New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: theme.textSecondary }} />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            style={{
                                                width: '100%',
                                                padding: '12px 48px 12px 48px',
                                                borderRadius: '12px',
                                                border: `1px solid ${theme.inputBorder}`,
                                                background: theme.input,
                                                color: theme.text,
                                                fontSize: '15px',
                                                outline: 'none'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '16px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: theme.textSecondary,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: 0
                                            }}
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '8px' }}>
                                    <button
                                        type="submit"
                                        disabled={isLoadingPassword}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '12px 24px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            background: isLoadingPassword ? theme.input : 'linear-gradient(135deg, #ef4444, #f43f5e)',
                                            color: isLoadingPassword ? theme.textMuted : 'white',
                                            fontSize: '15px',
                                            fontWeight: 600,
                                            cursor: isLoadingPassword ? 'not-allowed' : 'pointer',
                                            boxShadow: isLoadingPassword ? 'none' : '0 4px 12px rgba(239, 68, 68, 0.3)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <CheckCircle2 size={18} />
                                        {isLoadingPassword ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
