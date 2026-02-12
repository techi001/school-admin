import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// marker icon fix
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface InteractiveMapProps {
    position: [number, number] | null;
    setPosition: (pos: [number, number]) => void;
    center: [number, number];
    zoom: number;
}

export default function InteractiveMap({ position, setPosition, center, zoom }: InteractiveMapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize Map
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current).setView(position || center, zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
        });

        mapRef.current = map;

        // Cleanup
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Update Marker when position changes
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (position) {
            if (markerRef.current) {
                markerRef.current.setLatLng(position);
            } else {
                markerRef.current = L.marker(position, { icon: DefaultIcon }).addTo(map);
            }
            // map.setView(position); // Optional: pan to marker
        } else {
            if (markerRef.current) {
                markerRef.current.remove();
                markerRef.current = null;
            }
        }
    }, [position]);

    // Handle center/zoom updates if needed
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (center && !position) {
            map.setView(center, zoom);
        }
    }, [center, zoom]);

    return (
        <div
            ref={containerRef}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
        />
    );
}
