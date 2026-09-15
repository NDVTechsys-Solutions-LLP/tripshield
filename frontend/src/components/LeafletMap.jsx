import React, { useEffect, useRef } from "react";

// Uses global Leaflet (L) loaded via CDN in public/index.html
export default function LeafletMap({
  route = [],
  position = null,
  from = null,
  to = null,
  deviationPath = null,
  incident = null,
  className = "",
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const layersRef = useRef({});

  useEffect(() => {
    const L = window.L;
    if (!L || !containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([20.5937, 78.9629], 5);
    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { maxZoom: 19, attribution: "© OpenStreetMap contributors" }
    ).addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 200);
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Draw route + endpoints
  useEffect(() => {
    const L = window.L;
    const map = mapRef.current;
    if (!L || !map) return;
    const layers = layersRef.current;

    if (layers.route) map.removeLayer(layers.route);
    if (route && route.length > 1) {
      layers.route = L.polyline(route, {
        color: "#e60012",
        weight: 5,
        opacity: 0.85,
      }).addTo(map);
      map.fitBounds(layers.route.getBounds(), { padding: [40, 40] });
    }

    ["from", "to"].forEach((k) => {
      if (layers[k]) {
        map.removeLayer(layers[k]);
        layers[k] = null;
      }
    });
    const mk = (pt, color, label) =>
      L.marker(pt, {
        icon: L.divIcon({
          className: "",
          html: `<div style="background:${color};color:#fff;font:700 11px 'JetBrains Mono';padding:3px 7px;border-radius:6px;white-space:nowrap;box-shadow:0 2px 10px rgba(0,0,0,.6)">${label}</div>`,
          iconAnchor: [12, 12],
        }),
      }).addTo(map);
    if (from) layers.from = mk(from, "#10b981", "A");
    if (to) layers.to = mk(to, "#3b82f6", "B");
  }, [route, from, to]);

  // Deviation path
  useEffect(() => {
    const L = window.L;
    const map = mapRef.current;
    if (!L || !map) return;
    const layers = layersRef.current;
    if (layers.dev) {
      map.removeLayer(layers.dev);
      layers.dev = null;
    }
    if (deviationPath && deviationPath.length > 1) {
      layers.dev = L.polyline(deviationPath, {
        color: "#f59e0b",
        weight: 4,
        dashArray: "8 8",
      }).addTo(map);
    }
  }, [deviationPath]);

  // Incident radius
  useEffect(() => {
    const L = window.L;
    const map = mapRef.current;
    if (!L || !map) return;
    const layers = layersRef.current;
    if (layers.inc) {
      map.removeLayer(layers.inc);
      layers.inc = null;
    }
    if (incident) {
      layers.inc = L.circle(incident, {
        radius: 600,
        color: "#ef4444",
        fillColor: "#ef4444",
        fillOpacity: 0.18,
        weight: 2,
      }).addTo(map);
    }
  }, [incident]);

  // Moving vehicle marker
  useEffect(() => {
    const L = window.L;
    const map = mapRef.current;
    if (!L || !map || !position) return;
    const layers = layersRef.current;
    const html = `<div class="hsj-vehicle-marker" style="width:22px;height:22px;border-radius:50%;background:#e60012;border:3px solid #fff;display:flex;align-items:center;justify-content:center"></div>`;
    if (!layers.vehicle) {
      layers.vehicle = L.marker(position, {
        icon: L.divIcon({ className: "", html, iconAnchor: [11, 11] }),
        zIndexOffset: 1000,
      }).addTo(map);
    } else {
      layers.vehicle.setLatLng(position);
    }
    map.panTo(position, { animate: true, duration: 0.4 });
  }, [position]);

  return <div ref={containerRef} className={className} data-testid="leaflet-map" />;
}
