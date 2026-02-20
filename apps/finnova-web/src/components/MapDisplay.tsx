'use client';

import React, { useEffect, useMemo } from 'react';
import { useKakaoMap } from '@/hooks/useKakaoMaps';
import { Loader2, AlertCircle } from 'lucide-react';

interface MapDisplayProps {
  markers?: Array<{
    lat: number;
    lng: number;
    title?: string;
    onClick?: () => void;
  }>;
  center?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  circles?: Array<{
    lat: number;
    lng: number;
    radius: number;
    color?: string;
  }>;
  height?: string;
  className?: string;
}

export function MapDisplay({
  markers = [],
  center,
  zoom,
  circles = [],
  height = 'h-96',
  className = '',
}: MapDisplayProps) {
  const containerId = useMemo(() => `map-${Math.random().toString(36).substr(2, 9)}`, []);
  const { map, loading, error, addMarker, drawCircle, fitBounds } = useKakaoMap(containerId);

  // Add markers to map
  useEffect(() => {
    if (!map || markers.length === 0) return;

    markers.forEach((markerData) => {
      const marker = addMarker(
        { lat: markerData.lat, lng: markerData.lng },
        { title: markerData.title },
      );

      if (marker && markerData.onClick) {
        const kakao = (window as any).kakao;
        kakao?.maps?.event?.addListener(marker, 'click', markerData.onClick);
      }
    });

    // Fit bounds if multiple markers
    if (markers.length > 1) {
      try {
        fitBounds(markers.map((m) => ({ lat: m.lat, lng: m.lng })));
      } catch (err) {
        console.warn('fitBounds error:', err);
        // Silently fail - map will show default center
      }
    }
  }, [map, markers, addMarker, fitBounds]);

  // Draw circles on map
  useEffect(() => {
    if (!map || circles.length === 0) return;

    circles.forEach((circleData) => {
      drawCircle(
        { lat: circleData.lat, lng: circleData.lng },
        circleData.radius,
        circleData.color,
      );
    });
  }, [map, circles, drawCircle]);

  return (
    <div className={`relative w-full ${height} rounded-lg overflow-hidden border border-gray-300 ${className}`}>
      <div id={containerId} className="w-full h-full" />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            <span className="text-sm text-gray-600">지도 로드 중...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
          <div className="flex flex-col items-center gap-2 text-red-600">
            <AlertCircle className="w-6 h-6" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapDisplay;
