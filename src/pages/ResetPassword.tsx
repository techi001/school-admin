import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Loader2, Eye, EyeOff, ShieldCheck, CheckCircle, KeyRound } from 'lucide-react';
import logoImage from '../assets/icon.png';

export default function ResetPassword() {
    const navigate = useNavigate();
    const { resetPassword } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const passwordRequirements = [
        { text: 'At least 8 characters', valid: newPassword.length >= 8 },
        { text: 'Contains uppercase letter', valid: /[A-Z]/.test(newPassword) },
        { text: 'Contains lowercase letter', valid: /[a-z]/.test(newPassword) },
        { text: 'Contains a number', valid: /\d/.test(newPassword) },
    ];

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);

        try {
            await resetPassword(newPassword);
            navigate('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                minHeight: '100vh',
                width: '100vw',
                maxWidth: '100vw',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                fontFamily: "'Inter', sans-serif"
            }}
        >
            {/* Left Panel - Branding */}
            <div
                style={{
                    flex: 1,
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Animated Background */}
                <div style={{ position: 'absolute', inset: 0 }}>
                    <div style={{
                        position: 'absolute',
                        top: '20%',
                        left: '20%',
                        width: '300px',
                        height: '300px',
                        background: 'rgba(16, 185, 129, 0.3)',
                        borderRadius: '50%',
                        filter: 'blur(120px)'
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '30%',
                        right: '20%',
                        width: '250px',
                        height: '250px',
                        background: 'rgba(99, 102, 241, 0.3)',
                        borderRadius: '50%',
                        filter: 'blur(100px)'
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        right: '30%',
                        width: '200px',
                        height: '200px',
                        background: 'rgba(139, 92, 246, 0.2)',
                        borderRadius: '50%',
                        filter: 'blur(80px)'
                    }} />
                </div>

                {/* Grid Pattern */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0.03,
                        backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                        backgroundSize: '60px 60px'
                    }}
                />

                {/* Content */}
                <div style={{
                    position: 'relative',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '48px',
                    height: '100%'
                }}>
                    {/* Logo & Branding */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
                        <img
                            src={logoImage}
                            alt="Special Nest Logo"
                            style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '16px',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                                objectFit: 'cover'
                            }}
                        />
                        <div>
                            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'white', margin: 0 }}>Special Nest</h2>
                            <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>School Admin Portal</p>
                        </div>
                    </div>

                    <div style={{ maxWidth: '480px' }}>
                        <h1 style={{
                            fontSize: '40px',
                            fontWeight: 700,
                            lineHeight: 1.2,
                            marginBottom: '24px',
                            background: 'linear-gradient(to right, white, #cbd5e1, #94a3b8)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Secure Your Account
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: 1.7, marginBottom: '48px' }}>
                            Create a strong password to protect your school admin account. This is your first login, so please set a new secure password.
                        </p>
                    </div>

                    {/* Security Tips */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(1, 1fr)',
                        gap: '12px',
                        maxWidth: '480px'
                    }}>
                        {[
                            { icon: ShieldCheck, title: 'Strong Protection', desc: 'Use a mix of letters, numbers & symbols' },
                            { icon: KeyRound, title: 'Unique Password', desc: 'Don\'t reuse passwords from other sites' },
                            { icon: Lock, title: 'Keep It Secret', desc: 'Never share your password with anyone' },
                        ].map((tip, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '16px',
                                    borderRadius: '16px',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px'
                                }}
                            >
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(99, 102, 241, 0.2))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <tip.icon style={{ width: '22px', height: '22px', color: '#10b981' }} />
                                </div>
                                <div>
                                    <h3 style={{ color: 'white', fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{tip.title}</h3>
                                    <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>{tip.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Reset Form */}
            <div
                style={{
                    width: '100%',
                    maxWidth: '520px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    position: 'relative',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                }}
            >
                {/* Background decoration */}
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                    <div style={{
                        position: 'absolute',
                        top: '20%',
                        left: '10%',
                        width: '200px',
                        height: '200px',
                        background: 'rgba(16, 185, 129, 0.2)',
                        borderRadius: '50%',
                        filter: 'blur(100px)'
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '20%',
                        right: '10%',
                        width: '180px',
                        height: '180px',
                        background: 'rgba(99, 102, 241, 0.2)',
                        borderRadius: '50%',
                        filter: 'blur(80px)'
                    }} />
                </div>

                <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 10 }}>
                    {/* Glassmorphism Card */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '24px',
                        padding: '32px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
                    }}>

                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                margin: '0 auto 16px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
                            }}>
                                <ShieldCheck style={{ width: '32px', height: '32px', color: 'white' }} />
                            </div>
                            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Reset Password</h1>
                            <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Create a new secure password</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div style={{
                                marginBottom: '20px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)'
                            }}>
                                <p style={{ color: '#f87171', fontSize: '13px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f87171' }} />
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* New Password Input */}
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                                    New Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#64748b' }} />
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                        style={{
                                            width: '100%',
                                            paddingLeft: '44px',
                                            paddingRight: '44px',
                                            paddingTop: '14px',
                                            paddingBottom: '14px',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontSize: '14px',
                                            outline: 'none',
                                            transition: 'all 0.3s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)'}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '14px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {showNewPassword ?
                                            <EyeOff style={{ width: '18px', height: '18px', color: '#64748b' }} /> :
                                            <Eye style={{ width: '18px', height: '18px', color: '#64748b' }} />
                                        }
                                    </button>
                                </div>
                            </div>

                            {/* Password Requirements */}
                            <div style={{
                                padding: '14px',
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.08)'
                            }}>
                                <p style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', fontWeight: 600 }}>
                                    Password Requirements
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    {passwordRequirements.map((req, index) => (
                                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <CheckCircle style={{
                                                width: '14px',
                                                height: '14px',
                                                color: req.valid ? '#10b981' : '#475569',
                                                transition: 'color 0.2s'
                                            }} />
                                            <span style={{
                                                fontSize: '11px',
                                                color: req.valid ? '#10b981' : '#64748b',
                                                transition: 'color 0.2s'
                                            }}>
                                                {req.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Confirm Password Input */}
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                                    Confirm Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#64748b' }} />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        required
                                        style={{
                                            width: '100%',
                                            paddingLeft: '44px',
                                            paddingRight: '44px',
                                            paddingTop: '14px',
                                            paddingBottom: '14px',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: `1px solid ${confirmPassword && confirmPassword === newPassword ? 'rgba(16, 185, 129, 0.5)' : confirmPassword && confirmPassword !== newPassword ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontSize: '14px',
                                            outline: 'none',
                                            transition: 'all 0.3s'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '14px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {showConfirmPassword ?
                                            <EyeOff style={{ width: '18px', height: '18px', color: '#64748b' }} /> :
                                            <Eye style={{ width: '18px', height: '18px', color: '#64748b' }} />
                                        }
                                    </button>
                                </div>
                                {confirmPassword && confirmPassword !== newPassword && (
                                    <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>Passwords don't match</p>
                                )}
                                {confirmPassword && confirmPassword === newPassword && (
                                    <p style={{ color: '#10b981', fontSize: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <CheckCircle style={{ width: '14px', height: '14px' }} /> Passwords match
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || newPassword !== confirmPassword || newPassword.length < 8}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: isLoading || newPassword !== confirmPassword || newPassword.length < 8
                                        ? 'linear-gradient(135deg, #475569, #64748b)'
                                        : 'linear-gradient(135deg, #10b981, #059669)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    cursor: isLoading || newPassword !== confirmPassword || newPassword.length < 8 ? 'not-allowed' : 'pointer',
                                    opacity: isLoading || newPassword !== confirmPassword || newPassword.length < 8 ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.3s',
                                    boxShadow: isLoading || newPassword !== confirmPassword || newPassword.length < 8
                                        ? 'none'
                                        : '0 10px 30px rgba(16, 185, 129, 0.3)'
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                                        Updating password...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck style={{ width: '18px', height: '18px' }} />
                                        Set New Password
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
                            <p style={{ color: '#64748b', fontSize: '11px', margin: 0 }}>
                                © {new Date().getFullYear()} Special Nest. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input::placeholder {
          color: #475569;
        }
      `}</style>
        </div>
    );
}
