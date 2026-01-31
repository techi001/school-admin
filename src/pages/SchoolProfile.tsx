import { useState, useEffect } from 'react';
import { useTheme, getTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Save, MapPin, Plus, X, Upload, Image as ImageIcon, Navigation, ExternalLink, Loader2, CheckCircle } from 'lucide-react';
import { schoolService } from '../services/schoolService';
import InteractiveMap from '../components/InteractiveMap';
import ManageServices from './ManageServices';
import Swal from 'sweetalert2';

export default function SchoolProfilePage() {
    const { isDark } = useTheme();
    const theme = getTheme(isDark);
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'address' | 'location' | 'about' | 'images' | 'services'>('address');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [addressForm, setAddressForm] = useState({
        name: '',
        tag: '',
        address: '',
        city: '',
        landmark: '',
        busStand: '',
        metroStation: '',
        schoolNumber: '',
    });

    const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);

    const [achievements, setAchievements] = useState<string[]>(['']);
    const [amenities, setAmenities] = useState<string[]>(['']);
    const [services, setServices] = useState<string[]>(['']);

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [principalPreview, setPrincipalPreview] = useState<string | null>(null);
    const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null, null, null, null, null, null, null, null]);

    const [logoStore, setLogoStore] = useState<File | null>(null);
    const [principalStore, setPrincipalStore] = useState<File | null>(null);
    const [imageStores, setImageStores] = useState<(File | null)[]>([null, null, null, null, null, null, null, null, null, null]);

    // Load school profile on mount
    useEffect(() => {
        const loadProfile = async () => {
            if (!user?.schoolId) {
                setIsLoading(false);
                return;
            }

            try {
                const profile = await schoolService.getProfile(user.schoolId);

                setAddressForm({
                    name: profile.name || '',
                    tag: profile.tag || '',
                    address: profile.address || '',
                    city: profile.city || '',
                    landmark: profile.landmark || '',
                    busStand: profile.busStand || '',
                    metroStation: profile.metroStation || '',
                    schoolNumber: profile.schoolNumber || '',
                });

                if (profile.latitude && profile.longitude) {
                    const coords: [number, number] = [profile.latitude, profile.longitude];
                    setMapPosition(coords);
                    setMapCenter(coords);
                }

                setAchievements(profile.achievements?.length ? profile.achievements : ['']);
                setAmenities(profile.amenities?.length ? profile.amenities : ['']);
                setServices(profile.servicesOffered?.length ? profile.servicesOffered : ['']);

                if (profile.logoUrl) setLogoPreview(profile.logoUrl);
                if (profile.principalPhoto) setPrincipalPreview(profile.principalPhoto);

                // Map discrete image fields to array
                const loadedImages = [
                    profile.image1, profile.image2, profile.image3, profile.image4, profile.image5,
                    profile.image6, profile.image7, profile.image8, profile.image9, profile.image10
                ];
                setImagePreviews(loadedImages.map(img => img || null));
            } catch (err) {
                console.error('Failed to load school profile:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, [user?.schoolId]);

    const addItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        setter(prev => [...prev, '']);
    };

    const removeItem = async (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You want to remove this item?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#6366f1',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, remove it!'
        });

        if (result.isConfirmed) {
            setter(prev => prev.filter((_, i) => i !== index));
        }
    };

    const updateItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
        setter(prev => prev.map((item, i) => i === index ? value : item));
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
                    setMapPosition(coords);
                    setMapCenter(coords);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    alert('Unable to get your location. Please click on the map to set location.');
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    };

    const saveAddressDetails = async () => {
        if (!user?.schoolId) return;

        setIsSaving(true);
        setError(null);
        setSaveSuccess(null);

        try {
            await schoolService.updateProfile(user.schoolId, {
                name: addressForm.name,
                tag: addressForm.tag,
                address: addressForm.address,
                city: addressForm.city,
                landmark: addressForm.landmark,
                busStand: addressForm.busStand,
                metroStation: addressForm.metroStation,
                schoolNumber: addressForm.schoolNumber,
            });
            Swal.fire({
                icon: 'success',
                title: 'Saved!',
                text: 'Address details have been updated successfully.',
                timer: 2000,
                showConfirmButton: false,
                background: isDark ? '#1e293b' : '#fff',
                color: theme.text
            });
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: err.response?.data?.message || 'Failed to save address details',
                background: isDark ? '#1e293b' : '#fff',
                color: theme.text
            });
        } finally {
            setIsSaving(false);
        }
    };

    const saveLocation = async () => {
        if (!user?.schoolId || !mapPosition) return;

        setIsSaving(true);
        setError(null);
        setSaveSuccess(null);

        try {
            await schoolService.updateLocation(user.schoolId, mapPosition[0], mapPosition[1]);
            Swal.fire({
                icon: 'success',
                title: 'Location Saved!',
                text: 'School location coordinates updated.',
                timer: 2000,
                showConfirmButton: false,
                background: isDark ? '#1e293b' : '#fff',
                color: theme.text
            });
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.message || 'Failed to save location',
                background: isDark ? '#1e293b' : '#fff',
                color: theme.text
            });
        } finally {
            setIsSaving(false);
        }
    };

    const saveAboutDetails = async () => {
        if (!user?.schoolId) return;

        setIsSaving(true);
        setError(null);
        setSaveSuccess(null);

        try {
            await schoolService.updateProfile(user.schoolId, {
                achievements: achievements.filter(a => a.trim()),
                amenities: amenities.filter(a => a.trim()),
                servicesOffered: services.filter(s => s.trim()),
            });
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'About details updated successfully.',
                timer: 2000,
                showConfirmButton: false,
                background: isDark ? '#1e293b' : '#fff',
                color: theme.text
            });
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.message || 'Failed to save about details',
                background: isDark ? '#1e293b' : '#fff',
                color: theme.text
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileSelect = (file: File, type: 'logo' | 'principal' | 'image', index?: number) => {
        const previewUrl = URL.createObjectURL(file);
        if (type === 'logo') {
            setLogoStore(file);
            setLogoPreview(previewUrl);
        } else if (type === 'principal') {
            setPrincipalStore(file);
            setPrincipalPreview(previewUrl);
        } else if (type === 'image' && index !== undefined) {
            setImageStores(prev => {
                const updated = [...prev];
                updated[index] = file;
                return updated;
            });
            setImagePreviews(prev => {
                const updated = [...prev];
                updated[index] = previewUrl;
                return updated;
            });
        }
    };

    const saveImages = async () => {
        if (!user?.schoolId) return;
        setIsSaving(true);
        setError(null);
        setSaveSuccess(null);

        try {
            let logoUrl = logoPreview;
            let principalPhoto = principalPreview;
            let updatedImages = [...imagePreviews];

            if (logoStore) {
                logoUrl = await schoolService.uploadImage(user.schoolId, logoStore);
                setLogoPreview(logoUrl);
                setLogoStore(null);
            }

            if (principalStore) {
                principalPhoto = await schoolService.uploadImage(user.schoolId, principalStore);
                setPrincipalPreview(principalPhoto);
                setPrincipalStore(null);
            }

            for (let i = 0; i < imageStores.length; i++) {
                if (imageStores[i]) {
                    const url = await schoolService.uploadImage(user.schoolId, imageStores[i]!);
                    updatedImages[i] = url;
                }
            }
            setImagePreviews(updatedImages);

            setImageStores([null, null, null, null, null, null, null, null, null, null]);

            await schoolService.updateProfile(user.schoolId, {
                logoUrl: logoUrl || undefined,
                principalPhoto: principalPhoto || undefined,
                image1: updatedImages[0] || undefined,
                image2: updatedImages[1] || undefined,
                image3: updatedImages[2] || undefined,
                image4: updatedImages[3] || undefined,
                image5: updatedImages[4] || undefined,
                image6: updatedImages[5] || undefined,
                image7: updatedImages[6] || undefined,
                image8: updatedImages[7] || undefined,
                image9: updatedImages[8] || undefined,
                image10: updatedImages[9] || undefined
            });

            Swal.fire({
                icon: 'success',
                title: 'Images Saved!',
                text: 'All profile images have been updated.',
                timer: 2000,
                showConfirmButton: false,
                background: isDark ? '#1e293b' : '#fff',
                color: theme.text
            });
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'Upload Failed',
                text: err.response?.data?.message || 'Failed to save images',
                background: isDark ? '#1e293b' : '#fff',
                color: theme.text
            });
        } finally {
            setIsSaving(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '14px 16px',
        fontSize: '14px',
        border: `1px solid ${theme.inputBorder}`,
        borderRadius: '12px',
        background: theme.input,
        color: theme.text,
        outline: 'none',
        transition: 'border-color 0.2s'
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <Loader2 size={40} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if (!user?.schoolId) {
        return (
            <div style={{ padding: '60px 40px', textAlign: 'center', background: theme.card, borderRadius: '20px', border: `1px solid ${theme.cardBorder}`, maxWidth: '600px', margin: '40px auto' }}>
                <div style={{ width: '80px', height: '80px', margin: '0 auto 24px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={40} color="#ef4444" />
                </div>
                <h2 style={{ color: theme.text, fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>No School Assigned</h2>
                <p style={{ color: theme.textSecondary, marginBottom: '24px', lineHeight: 1.6 }}>Your account doesn't have a school assigned yet.</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', background: theme.input, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px', color: theme.text, fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>Refresh Page</button>
                    <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}>Logout & Login Again</button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: theme.text, margin: 0 }}>School Profile</h1>
                <p style={{ color: theme.textSecondary, marginTop: '8px' }}>Manage your school information and settings</p>
            </div>

            {saveSuccess && (
                <div style={{ marginBottom: '20px', padding: '14px 20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle size={20} color="#10b981" />
                    <span style={{ color: '#10b981', fontWeight: 500 }}>{saveSuccess}</span>
                </div>
            )}

            {error && (
                <div style={{ marginBottom: '20px', padding: '14px 20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px' }}>
                    <span style={{ color: '#ef4444', fontWeight: 500 }}>{error}</span>
                </div>
            )}

            <div style={{ background: theme.card, backdropFilter: 'blur(20px)', border: `1px solid ${theme.cardBorder}`, borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: `1px solid ${theme.cardBorder}`, background: theme.tableBg, overflowX: 'auto' }}>
                    {(['address', 'location', 'about', 'images', 'services'] as const).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{
                            flex: 1, padding: '16px 24px', fontSize: '14px', fontWeight: 600, textTransform: 'capitalize', border: 'none',
                            borderBottom: activeTab === tab ? '3px solid #6366f1' : '3px solid transparent',
                            background: activeTab === tab ? theme.card : 'transparent',
                            color: activeTab === tab ? '#818cf8' : theme.textSecondary,
                            cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
                        }}>
                            {tab === 'address' && 'School Address'}
                            {tab === 'location' && 'School Location'}
                            {tab === 'about' && 'About School'}
                            {tab === 'images' && 'Upload Images'}
                            {tab === 'services' && 'Manage Services'}
                        </button>
                    ))}
                </div>

                <div style={{ padding: '32px' }}>
                    {activeTab === 'address' && (
                        <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: theme.text }}>School Name <span style={{ color: '#ef4444' }}>*</span></label>
                                <input type="text" value={addressForm.name} onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })} style={inputStyle} placeholder="Enter school name" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: theme.text }}>School Tag</label>
                                <input type="text" value={addressForm.tag} onChange={(e) => setAddressForm({ ...addressForm, tag: e.target.value })} style={inputStyle} placeholder="e.g., Empowering Every Child" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: theme.text }}>School Address <span style={{ color: '#ef4444' }}>*</span></label>
                                <textarea value={addressForm.address} onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Enter complete address" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: theme.text }}>City <span style={{ color: '#ef4444' }}>*</span></label>
                                <input type="text" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} style={inputStyle} placeholder="Enter city name" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: theme.text }}>Nearby Landmark</label>
                                    <input type="text" value={addressForm.landmark} onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })} style={inputStyle} placeholder="e.g., Near City Hospital" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: theme.text }}>Bus Stand</label>
                                    <input type="text" value={addressForm.busStand} onChange={(e) => setAddressForm({ ...addressForm, busStand: e.target.value })} style={inputStyle} placeholder="Nearest bus stop" />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: theme.text }}>Metro Station</label>
                                <input type="text" value={addressForm.metroStation} onChange={(e) => setAddressForm({ ...addressForm, metroStation: e.target.value })} style={inputStyle} placeholder="Nearest metro station" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: theme.text }}>School Phone Number</label>
                                <input type="text" value={addressForm.schoolNumber} onChange={(e) => setAddressForm({ ...addressForm, schoolNumber: e.target.value })} style={inputStyle} placeholder="Enter school phone number" />
                            </div>
                            <button onClick={saveAddressDetails} disabled={isSaving || !addressForm.name || !addressForm.address || !addressForm.city} style={{
                                padding: '14px 24px', fontSize: '14px', fontWeight: 600, color: 'white',
                                background: isSaving || !addressForm.name || !addressForm.address || !addressForm.city ? theme.textMuted : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                border: 'none', borderRadius: '12px',
                                cursor: isSaving || !addressForm.name || !addressForm.address || !addressForm.city ? 'not-allowed' : 'pointer',
                                boxShadow: isSaving ? 'none' : '0 8px 20px rgba(99,102,241,0.4)',
                                display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginTop: '8px',
                                opacity: isSaving || !addressForm.name || !addressForm.address || !addressForm.city ? 0.6 : 1
                            }}>
                                {isSaving ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={20} />}
                                {isSaving ? 'Saving...' : 'Save Address Details'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'location' && (
                        <div style={{ display: 'grid', gap: '24px', maxWidth: '900px' }}>
                            <div style={{ padding: '16px 20px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <MapPin size={24} color="#818cf8" />
                                <div>
                                    <p style={{ color: theme.text, fontSize: '14px', fontWeight: 600, margin: 0 }}>Click on the map to set your school location</p>
                                    <p style={{ color: theme.textSecondary, fontSize: '12px', margin: '4px 0 0' }}>Or use the "Get Current Location" button below</p>
                                </div>
                            </div>

                            <div style={{ borderRadius: '16px', overflow: 'hidden', border: `1px solid ${theme.cardBorder}`, height: '400px' }}>
                                {activeTab === 'location' && (
                                    <InteractiveMap
                                        position={mapPosition}
                                        setPosition={(pos: [number, number]) => {
                                            setMapPosition(pos);
                                            setMapCenter(pos);
                                        }}
                                        center={mapCenter}
                                        zoom={mapPosition ? 15 : 5}
                                    />
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <button onClick={getCurrentLocation} style={{ padding: '12px 20px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>
                                    <Navigation size={18} />Get Current Location
                                </button>
                                {mapPosition && (
                                    <a href={`https://www.google.com/maps?q=${mapPosition[0]},${mapPosition[1]}`} target="_blank" rel="noopener noreferrer" style={{ padding: '12px 20px', background: theme.input, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px', color: theme.textSecondary, fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                                        <ExternalLink size={18} />View in Google Maps
                                    </a>
                                )}
                            </div>

                            {mapPosition && (
                                <div style={{ padding: '16px 20px', background: theme.tableBg, borderRadius: '12px', border: `1px solid ${theme.cardBorder}` }}>
                                    <p style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>Selected Coordinates</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: theme.textMuted }}>Latitude</label>
                                            <input type="text" value={mapPosition[0].toFixed(6)} readOnly style={{ ...inputStyle, background: theme.card }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: theme.textMuted }}>Longitude</label>
                                            <input type="text" value={mapPosition[1].toFixed(6)} readOnly style={{ ...inputStyle, background: theme.card }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button onClick={saveLocation} disabled={!mapPosition || isSaving} style={{ padding: '14px 24px', fontSize: '14px', fontWeight: 600, color: 'white', background: mapPosition && !isSaving ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : theme.textMuted, border: 'none', borderRadius: '12px', cursor: mapPosition && !isSaving ? 'pointer' : 'not-allowed', boxShadow: mapPosition && !isSaving ? '0 8px 20px rgba(99,102,241,0.4)' : 'none', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', opacity: mapPosition && !isSaving ? 1 : 0.6 }}>
                                {isSaving ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={20} />}
                                {isSaving ? 'Saving...' : 'Save Location'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div style={{ display: 'grid', gap: '32px', maxWidth: '600px' }}>
                            {[{ label: 'School Achievements', items: achievements, setter: setAchievements, required: false },
                            { label: 'School Amenities', items: amenities, setter: setAmenities, required: true },
                            { label: 'Services Offered', items: services, setter: setServices, required: true }
                            ].map(({ label, items, setter, required }) => (
                                <div key={label}>
                                    <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: 600, color: theme.text }}>{label} {required && <span style={{ color: '#ef4444' }}>*</span>}</label>
                                    {items.map((item, index) => (
                                        <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <input type="text" value={item} onChange={(e) => updateItem(setter, index, e.target.value)} style={inputStyle} placeholder={`Enter ${label.toLowerCase().replace('school ', '')}`} />
                                            <button onClick={() => removeItem(setter, index)} disabled={required && items.length === 1} style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#ef4444', cursor: required && items.length === 1 ? 'not-allowed' : 'pointer', opacity: required && items.length === 1 ? 0.5 : 1 }}><X size={20} /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => addItem(setter)} style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 600, background: theme.input, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px', color: theme.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}><Plus size={16} />Add {label.split(' ')[1]}</button>
                                </div>
                            ))}
                            <button onClick={saveAboutDetails} disabled={isSaving} style={{ padding: '14px 24px', fontSize: '14px', fontWeight: 600, color: 'white', background: isSaving ? theme.textMuted : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '12px', cursor: isSaving ? 'not-allowed' : 'pointer', boxShadow: isSaving ? 'none' : '0 8px 20px rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', opacity: isSaving ? 0.6 : 1 }}>
                                {isSaving ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={20} />}
                                {isSaving ? 'Saving...' : 'Save About Details'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'images' && (
                        <div style={{ display: 'grid', gap: '32px', maxWidth: '800px' }}>
                            {[
                                { label: 'School Logo', preview: logoPreview, type: 'logo' as const, desc: 'Max 200MB', icon: Upload },
                                { label: 'Principal Photo', preview: principalPreview, type: 'principal' as const, desc: 'Optional, Max 200MB', icon: ImageIcon }
                            ].map(({ label, preview, type, desc, icon: Icon }) => (
                                <div key={label}>
                                    <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: 600, color: theme.text }}>{label} <span style={{ fontWeight: 400, color: theme.textMuted }}>({desc})</span></label>
                                    <div
                                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#6366f1'; }}
                                        onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = theme.cardBorder; }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.currentTarget.style.borderColor = theme.cardBorder;
                                            if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0], type);
                                        }}
                                        onClick={() => document.getElementById(`file-${type}`)?.click()}
                                        style={{
                                            padding: preview ? '10px' : '40px', background: theme.input, borderRadius: '16px', border: `2px dashed ${theme.cardBorder}`,
                                            textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden', minHeight: '120px',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                        }}
                                    >
                                        <input type="file" id={`file-${type}`} style={{ display: 'none' }} accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], type)} />
                                        {preview ? (
                                            <div style={{ position: 'relative', width: '100%', maxWidth: '200px' }}>
                                                <img src={preview} alt={label} style={{ width: '100%', borderRadius: '12px', display: 'block' }} />
                                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} className="hover-overlay">
                                                    <Upload size={24} color="white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <Icon size={40} color={theme.textMuted} style={{ margin: '0 auto 12px' }} />
                                                <p style={{ color: theme.text, fontWeight: 600, marginBottom: '4px' }}>Click to upload or drag and drop</p>
                                                <p style={{ color: theme.textMuted, fontSize: '12px' }}>PNG, JPG up to 200MB</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div>
                                <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: 600, color: theme.text }}>School Images <span style={{ fontWeight: 400, color: theme.textMuted }}>(Up to 10, 200MB each)</span></label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                                    {imagePreviews.map((preview, i) => (
                                        <div
                                            key={i}
                                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#6366f1'; }}
                                            onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = theme.cardBorder; }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                e.currentTarget.style.borderColor = theme.cardBorder;
                                                if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0], 'image', i);
                                            }}
                                            onClick={() => document.getElementById(`file-image-${i}`)?.click()}
                                            style={{
                                                padding: preview ? '8px' : '32px 16px', background: theme.input, borderRadius: '12px', border: `2px dashed ${theme.cardBorder}`,
                                                textAlign: 'center', cursor: 'pointer', position: 'relative', height: '140px', overflow: 'hidden',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >
                                            <input type="file" id={`file-image-${i}`} style={{ display: 'none' }} accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'image', i)} />
                                            {preview ? (
                                                <img src={preview} alt={`School ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                            ) : (
                                                <>
                                                    <Upload size={28} color={theme.textMuted} style={{ margin: '0 auto 8px' }} />
                                                    <p style={{ color: theme.textMuted, fontSize: '12px' }}>Image {i + 1}</p>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={saveImages}
                                disabled={isSaving}
                                style={{
                                    padding: '14px 24px', fontSize: '14px', fontWeight: 600, color: 'white',
                                    background: isSaving ? theme.textMuted : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    border: 'none', borderRadius: '12px', cursor: isSaving ? 'not-allowed' : 'pointer',
                                    boxShadow: isSaving ? 'none' : '0 8px 20px rgba(99,102,241,0.4)',
                                    display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
                                    opacity: isSaving ? 0.6 : 1
                                }}
                            >
                                {isSaving ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={20} />}
                                {isSaving ? 'Uploading & Saving Images...' : 'Save Images'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <div style={{ maxWidth: '100% ' }}>
                            <ManageServices />
                        </div>
                    )}
                </div>
            </div>

            <style>{` 
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } 
                .hover-overlay:hover { opacity: 1 !important; }
            `}</style>
        </div >
    );
}
