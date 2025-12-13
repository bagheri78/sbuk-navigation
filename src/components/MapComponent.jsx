// src/components/MapComponent.jsx
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// درست کردن آیکون پیش‌فرض
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function MapComponent() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const userMarker = useRef(null); // این خط رو بالای useEffect بذار

  useEffect(() => {
    // اگر قبلاً ساخته شده بود، دوباره نساز
    if (mapInstance.current) return;

    // ساخت نقشه
    mapInstance.current = L.map('map').setView([30.25455, 57.10345], 16.5);

    // OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    // دکمه موقعیت‌یابی + تست روی کامپیوتر
const LocationButton = L.Control.extend({
  options: { position: 'bottomright' },

  onAdd: function () {
    const btn = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
    btn.style.backgroundColor = '#003366';
    btn.style.color = 'white';
    btn.style.width = '44px';
    btn.style.height = '44px';
    btn.style.borderRadius = '50%';
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.cursor = 'pointer';
    btn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.4)';
    btn.style.fontSize = '20px';
    btn.innerHTML = 'موقعیت‌یابی';
    btn.title = 'موقعیت فعلی من';

    btn.onclick = () => {
      btn.innerHTML = 'در حال جستجو...';
      btn.style.backgroundColor = '#FF6600';

      // تست روی کامپیوتر (موقعیت فرضی داخل دانشگاه)
      const testLat = 30.2920;
      const testLng = 57.0650;

      mapInstance.current.setView([testLat, testLng], 18);

      if (userMarker.current) mapInstance.current.removeLayer(userMarker.current);

      userMarker.current = L.circleMarker([testLat, testLng], {
        radius: 15,
        fillColor: '#0066CC',
        color: '#fff',
        weight: 4,
        fillOpacity: 1
      })
      .addTo(mapInstance.current)
      .bindPopup('<div class="font-bold text-blue-900">شما اینجا هستید! (تست)</div>')
      .openPopup();

      setTimeout(() => {
        btn.innerHTML = 'موقعیت‌یابی';
        btn.style.backgroundColor = '#003366';
      }, 1500);
    };

    return btn;
  }
});

new LocationButton().addTo(mapInstance.current);

    // مکان‌های دانشگاه (مختصات دقیق)
    const locations = [
      { lat: 30.2948, lng: 57.0685, name: "دانشکده فنی و مهندسی", color: "#0066CC" },
      { lat: 30.2932, lng: 57.0668, name: "کتابخانه مرکزی", color: "#28A745" },
      { lat: 30.2955, lng: 57.0702, name: "سلف سرویس (غذاخوری)", color: "#FD7E14" },
      { lat: 30.2910, lng: 57.0650, name: "خوابگاه پسران", color: "#8E44AD" },
      { lat: 30.2970, lng: 57.0720, name: "دانشکده علوم پایه", color: "#E74C3C" },
      { lat: 30.2965, lng: 57.0690, name: "مسجد دانشگاه", color: "#F1C40F" },
      { lat: 30.2925, lng: 57.0675, name: "آمفی‌تئاتر", color: "#9B59B6" },
    ];

    // اضافه کردن مارکرها
    locations.forEach(loc => {
      L.circleMarker([loc.lat, loc.lng], {
        radius: 12,
        fillColor: loc.color,
        color: "#fff",
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9
      })
      .addTo(mapInstance.current)
      .bindPopup(`
        <div dir="rtl" class="text-center">
          <div class="font-bold text-lg mb-1">${loc.name}</div>
          <button class="mt-2 bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700">
            مسیریابی به اینجا
          </button>
        </div>
      `);
    });

    // این خط خیلی مهمه! بدون این نقشه تو React نشون داده نمی‌شه
    setTimeout(() => {
      mapInstance.current?.invalidateSize();
    }, 100);

  }, []);

 return (
  <div
    style={{
      position: "relative",
      width: "100vw",
      height: "100vh",
    }}
  >
    {/* نوار جستجو */}
    <div
      style={{
        position: "absolute",
        top: "12px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        background: "white",
        padding: "8px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
        width: "90vw",
        maxWidth: "320px",
      }}
    >
      <input
        type="text"
        placeholder="جستجوی مکان در دانشگاه..."
        style={{
          width: "100%",
          padding: "8px",
          fontSize: "14px",
          direction: "rtl",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />
    </div>

    {/* نقشه */}
    <div
      id="map"
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  </div>
);


}