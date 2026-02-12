import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Phone, Loader2, Calendar, Building2, Eye, EyeOff, BarChart3, GraduationCap } from 'lucide-react';
import logoImage from '../assets/icon.png';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate input (check if empty)
        if (!mobileNumber.trim()) {
            setError('Please enter a valid username or mobile number');
            return;
        }

        setIsLoading(true);

        try {
            const response = await login(mobileNumber, password);

            // Check if this is first login - redirect to reset password
            if (response.user.isFirstLogin) {
                navigate('/reset-password');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        { icon: Building2, title: 'School Profile', desc: 'Manage your school info' },
        { icon: Calendar, title: 'Slot Management', desc: 'Control schedules' },
        { icon: BarChart3, title: 'Analytics', desc: 'Real-time insights' },
        { icon: GraduationCap, title: 'Bookings', desc: 'Track all bookings' },
    ];

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
                        background: 'rgba(99, 102, 241, 0.3)',
                        borderRadius: '50%',
                        filter: 'blur(120px)'
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '30%',
                        right: '20%',
                        width: '250px',
                        height: '250px',
                        background: 'rgba(139, 92, 246, 0.3)',
                        borderRadius: '50%',
                        filter: 'blur(100px)'
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        right: '30%',
                        width: '200px',
                        height: '200px',
                        background: 'rgba(236, 72, 153, 0.2)',
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
                            Manage Your School Seamlessly
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: 1.7, marginBottom: '48px' }}>
                            Control your school profile, manage booking slots, and track your revenue with our comprehensive school admin dashboard.
                        </p>
                    </div>

                    {/* Feature Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '12px',
                        maxWidth: '480px'
                    }}>
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '16px',
                                    borderRadius: '16px',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <feature.icon style={{ width: '28px', height: '28px', color: '#818cf8', marginBottom: '8px' }} />
                                <h3 style={{ color: 'white', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{feature.title}</h3>
                                <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
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
                        background: 'rgba(99, 102, 241, 0.2)',
                        borderRadius: '50%',
                        filter: 'blur(100px)'
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '20%',
                        right: '10%',
                        width: '180px',
                        height: '180px',
                        background: 'rgba(139, 92, 246, 0.2)',
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
                            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Welcome Back</h1>
                            <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Sign in with your registered mobile number</p>
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
                            {/* Username Input */}
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                                    Username or Mobile Number
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Phone style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#64748b' }} />
                                    <input
                                        type="text"
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value)}
                                        placeholder="Enter Username or Mobile"
                                        required
                                        style={{
                                            width: '100%',
                                            paddingLeft: '44px',
                                            paddingRight: '14px',
                                            paddingTop: '14px',
                                            paddingBottom: '14px',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontSize: '14px',
                                            outline: 'none',
                                            transition: 'all 0.3s',
                                            letterSpacing: '1px'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)'}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                                    Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#64748b' }} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
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
                                        onFocus={(e) => e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)'}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
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
                                        {showPassword ?
                                            <EyeOff style={{ width: '18px', height: '18px', color: '#64748b' }} /> :
                                            <Eye style={{ width: '18px', height: '18px', color: '#64748b' }} />
                                        }
                                    </button>
                                </div>
                            </div>

                            {/* Options Row */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        style={{ width: '16px', height: '16px', accentColor: '#6366f1' }}
                                    />
                                    <span style={{ color: '#94a3b8' }}>Remember me</span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || !mobileNumber.trim()}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: isLoading || !mobileNumber.trim()
                                        ? 'linear-gradient(135deg, #475569, #64748b)'
                                        : 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    cursor: isLoading || !mobileNumber.trim() ? 'not-allowed' : 'pointer',
                                    opacity: isLoading || !mobileNumber.trim() ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.3s',
                                    boxShadow: isLoading || !mobileNumber.trim() ? 'none' : '0 10px 30px rgba(99, 102, 241, 0.3)'
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        {/* Registration Link */}
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                                Need to register your school?{' '}
                                <Link
                                    to="/register"
                                    style={{
                                        color: '#818cf8',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#a78bfa'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#818cf8'}
                                >
                                    Register Now
                                </Link>
                            </p>
                        </div>

                        <div style={{
                            marginTop: '20px',
                            padding: '12px',
                            borderRadius: '10px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.2)'
                        }}>
                            <p style={{ color: '#818cf8', fontSize: '11px', margin: 0 }}>
                                ℹ️ Please connect with Admin to create the School Login
                            </p>
                        </div>

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
