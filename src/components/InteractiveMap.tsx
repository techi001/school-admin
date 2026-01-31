import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useCallback } from 'react';

const containerStyle = {
    width: '100%',
    height: '100%'
};

export default function InteractiveMap({ position, setPosition, center, zoom }: any) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE' ? '' : apiKey
    });

    const onLoad = useCallback(function callback(_map: google.maps.Map) {
        // Map loaded
    }, []);

    const onUnmount = useCallback(function callback(_map: google.maps.Map) {
        // Map unmounted
    }, []);

    const onClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            setPosition([e.latLng.lat(), e.latLng.lng()]);
        }
    }, [setPosition]);

    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f3f4f6',
                padding: '20px',
                textAlign: 'center'
            }}>
                <p style={{ color: '#374151', fontWeight: 600, marginBottom: '8px' }}>Google Maps API Key Missing</p>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    Please add your API key to the <code>.env</code> file: <br />
                    <code>VITE_GOOGLE_MAPS_API_KEY=your_key_here</code>
                </p>
            </div>
        );
    }

    return isLoaded ? (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={position ? { lat: position[0], lng: position[1] } : { lat: center[0], lng: center[1] }}
            zoom={zoom}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={onClick}
            options={{
                disableDefaultUI: false,
                zoomControl: true,
            }}
        >
            {position && (
                <Marker
                    position={{ lat: position[0], lng: position[1] }}
                />
            )}
        </GoogleMap>
    ) : (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Loading Google Map...</p>
        </div>
    );
}
