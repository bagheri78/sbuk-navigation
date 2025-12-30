// src/components/MapComponent.jsx
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { useState } from "react";


// درست کردن آیکون پیش‌فرض
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const locations = [
  { lat: 30.254515, lng: 57.10425, name: "ساختمان S، دانشکده فنی و مهندسی", color: "#0066CC" },
  { lat: 30.25435, lng: 57.10317, name: "کتابخانه مرکزی", color: "#28A745" },
  { lat: 30.2955, lng: 57.0702, name: "سلف سرویس (غذاخوری)", color: "#FD7E14" },
  { lat: 30.2910, lng: 57.0650, name: "خوابگاه پسران", color: "#8E44AD" },
  { lat: 30.2970, lng: 57.0720, name: "دانشکده علوم پایه", color: "#E74C3C" },
  { lat: 30.2965, lng: 57.0690, name: "مسجد دانشگاه", color: "#F1C40F" },
  { lat: 30.25559, lng: 57.103495, name: "تالار وحدت", color: "#9B59B6" },
];

const locationSVG = `
<svg width="22" height="22" viewBox="0 0 24 24" fill="none"
     stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="3"/>
  <line x1="12" y1="2" x2="12" y2="6"/>
  <line x1="12" y1="18" x2="12" y2="22"/>
  <line x1="2" y1="12" x2="6" y2="12"/>
  <line x1="18" y1="12" x2="22" y2="12"/>
</svg>
`;



export default function MapComponent() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const userMarker = useRef(null); 
  const routingControl = useRef(null);
  const markersRef = useRef({});
  const [routingMode, setRoutingMode] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [mode, setMode] = useState("normal"); 
// normal | routing-start | routing-dest

  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);



  

 const startRouting = (sLat, sLng, dLat, dLng) => {
  if (routingControl.current) {
    mapInstance.current.removeControl(routingControl.current);
  }

  routingControl.current = L.Routing.control({
    waypoints: [
      L.latLng(sLat, sLng),
      L.latLng(dLat, dLng)
    ],
    routeWhileDragging: false,
    addWaypoints: false,
    draggableWaypoints: false,
    show: false,
    createMarker: () => null,
    lineOptions: {
      styles: [{ color: '#0066CC', weight: 6 }]
    }
  }).addTo(mapInstance.current);
};


  useEffect(() => {
    // اگر قبلاً ساخته شده بود، دوباره نساز
    if (mapInstance.current) return;

    // ساخت نقشه
   // محدوده دانشگاه باهنر
    const universityBounds = L.latLngBounds(
      [30.23, 57.0830], // جنوب غربی
      [30.26, 57.14]  // شمال شرقی
    );

    // ساخت نقشه با محدودیت کامل
    mapInstance.current = L.map('map', {
      center: [30.25455, 57.10345],
      zoom: 17.5,
      minZoom: 16,
      maxZoom: 19,
      maxBounds: universityBounds,
      maxBoundsViscosity: 1.0,
    });


    mapInstance.current.doubleClickZoom.disable();
    mapInstance.current.options.maxBoundsViscosity = 1.0;



    // OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(mapInstance.current);
    const RoutingButton = L.Control.extend({
  options: { position: 'bottomright' },

  onAdd: function () {
    const btn = L.DomUtil.create(
      'div',
      'leaflet-bar leaflet-control leaflet-control-custom'
    );

    btn.style.width = '48px';
btn.style.height = '48px';
btn.style.borderRadius = '50%'; // 👈 مهم‌ترین خط
btn.style.backgroundColor = '#0066CC';
btn.style.color = 'white';
btn.style.display = 'flex';
btn.style.alignItems = 'center';
btn.style.justifyContent = 'center';
btn.style.cursor = 'pointer';
btn.style.fontSize = '22px';
btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.35)';
btn.style.userSelect = 'none';


    btn.innerHTML = '🧭';

    L.DomEvent.disableClickPropagation(btn);

    btn.onclick = () => {
  setMode("routing-start");
  setSearchText("");
};


    return btn;
  }
});



new RoutingButton().addTo(mapInstance.current);
const ProfileButton = L.Control.extend({
  options: { position: 'bottomright' },

  onAdd: function () {
    const btn = L.DomUtil.create(
      'div',
      'leaflet-bar leaflet-control leaflet-control-custom'
    );

    btn.style.width = '48px';
    btn.style.height = '48px';
    btn.style.borderRadius = '50%';
    btn.style.backgroundColor = '#444';
    btn.style.color = 'white';
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.cursor = 'pointer';
    btn.style.fontSize = '22px';
    btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.35)';
    btn.style.userSelect = 'none';
    btn.style.marginTop = '8px'; // فاصله از دکمه بالایی

    btn.innerHTML = '👤';

    L.DomEvent.disableClickPropagation(btn);

   btn.onclick = () => {
  window.location.href = '/profilepage/profile.html';
};



    return btn;
  }
});
new ProfileButton().addTo(mapInstance.current);



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
    btn.innerHTML = locationSVG;
    btn.title = 'موقعیت فعلی من';

    btn.onclick = () => {
      if (!navigator.geolocation) {
        alert("مرورگر شما موقعیت‌یابی را پشتیبانی نمی‌کند");
        return;
      }

      btn.innerHTML = 'در حال یافتن...';
      btn.style.backgroundColor = '#FF6600';

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          mapInstance.current.setView([lat, lng], 18);

          if (userMarker.current) {
            mapInstance.current.removeLayer(userMarker.current);
          }

          userMarker.current = L.circleMarker([lat, lng], {
            radius: 14,
            fillColor: '#0066CC',
            color: '#fff',
            weight: 4,
            fillOpacity: 1
          })
            .addTo(mapInstance.current)
            .bindPopup('📍 موقعیت فعلی شما')
            .openPopup();

          btn.innerHTML = 'locationSVG';
          btn.style.backgroundColor = '#003366';
        },
        (error) => {
          alert('امکان دریافت موقعیت وجود ندارد');
          btn.innerHTML = 'موقعیت‌یابی';
          btn.style.backgroundColor = '#003366';
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    };


    return btn;
  }
});

new LocationButton().addTo(mapInstance.current);




   locations.forEach(loc => {
    const marker = L.circleMarker([loc.lat, loc.lng], {
      radius: 12,
      fillColor: loc.color,
      color: "#fff",
      weight: 3,
      opacity: 1,
      fillOpacity: 0.9
    })
      .addTo(mapInstance.current)
      .bindPopup(`<strong>${loc.name}</strong>`);

    markersRef.current[loc.name] = marker;
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
        placeholder={
  mode === "routing-start"
    ? "مبدا را انتخاب کنید"
    : mode === "routing-dest"
    ? "مقصد را انتخاب کنید"
    : "جستجو..."
}

        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          fontSize: "14px",
          direction: "rtl",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

     {searchText && (
  <div style={{ marginTop: "6px", maxHeight: "150px", overflowY: "auto" }}>
    {locations
      .filter(loc => loc.name.includes(searchText))
      .map(loc => (
        <div
          key={loc.name}
          style={{
            padding: "6px",
            cursor: "pointer",
            borderBottom: "1px solid #eee"
          }}
          onClick={() => {
            if (mode === "normal") {
              mapInstance.current.setView([loc.lat, loc.lng], 18);
              setSearchText(loc.name);
            }

            if (mode === "routing-start") {
              setStartPoint(loc);
              setMode("routing-dest");
              setSearchText("");
            }

            if (mode === "routing-dest") {
              setEndPoint(loc);
              setMode("normal");
              setSearchText(loc.name);
              startRouting(
                startPoint.lat,
                startPoint.lng,
                loc.lat,
                loc.lng
              );
            }
          }}
        >
          📍 {loc.name}
        </div>
      ))}
  </div>
)}



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