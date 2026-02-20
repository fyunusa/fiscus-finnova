/**
 * React hooks for Kakao Maps
 */

import { useState, useCallback, useEffect } from 'react';
import { kakaoMapsService, GeocodeResult, AddressSearchResult, Place } from '@/services/kakaoMaps.service';

/**
 * Hook for address search functionality
 * Tries address search first, then place search as fallback
 */
export function useAddressSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AddressSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First try address search
      const addressResults = await kakaoMapsService.searchAddress(searchQuery);
      
      if (addressResults && addressResults.length > 0) {
        console.log('✅ Found addresses:', addressResults.length);
        setResults(addressResults);
      } else {
        // Fallback: try place search (for place names like "강남역")
        console.log('ℹ️ No addresses found, trying place search...');
        try {
          const placeResults = await kakaoMapsService.searchPlaces(searchQuery);
          
          if (placeResults && placeResults.length > 0) {
            // Convert place results to address search result format
            const convertedResults: AddressSearchResult[] = placeResults.map(place => ({
              addressName: place.name,
              roadAddressName: place.roadAddress || place.address,
              x: place.x.toString(),
              y: place.y.toString(),
              buildingName: place.name,
              district: '',
            }));
            console.log('✅ Found places:', convertedResults.length);
            setResults(convertedResults);
          } else {
            console.log('⚠️ No results found for:', searchQuery);
            setResults([]);
            setError('검색 결과가 없습니다. 다른 키워드를 시도해주세요.');
          }
        } catch (placeError) {
          console.error('Place search error:', placeError);
          setError('주소 검색에 실패했습니다.');
          setResults([]);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '주소 검색에 실패했습니다.';
      console.error('Search error:', errorMessage);
      setError(errorMessage);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectAddress = useCallback((result: AddressSearchResult) => {
    return {
      address: result.roadAddressName || result.addressName,
      lat: parseFloat(result.y),
      lng: parseFloat(result.x),
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    search,
    selectAddress,
  };
}

/**
 * Hook for geocoding (address to coordinates)
 */
export function useGeocoding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocode = useCallback(async (address: string): Promise<GeocodeResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await kakaoMapsService.geocode(address);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '지오코딩에 실패했습니다.';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<GeocodeResult | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await kakaoMapsService.reverseGeocode(lat, lng);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '역지오코딩에 실패했습니다.';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    loading,
    error,
    geocode,
    reverseGeocode,
  };
}

/**
 * Hook for place search
 */
export function usePlaceSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (searchQuery: string, lat?: number, lng?: number, radius?: number) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const searchResults = await kakaoMapsService.searchPlaces(
          searchQuery,
          lat,
          lng,
          radius,
        );
        setResults(searchResults);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '장소 검색에 실패했습니다.';
        setError(errorMessage);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    search,
  };
}

/**
 * Hook for map initialization and management
 */
export function useKakaoMap(containerId?: string) {
  const [map, setMap] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerId) return;

    const initializeMap = async () => {
      setLoading(true);
      setError(null);

      try {
        await kakaoMapsService.initialize();
        const mapInstance = await kakaoMapsService.createMap(containerId);
        setMap(mapInstance);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '지도 초기화에 실패했습니다.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    initializeMap();
  }, [containerId]);

  const addMarker = useCallback(
    (position: { lat: number; lng: number }, options?: { title?: string; image?: string }) => {
      if (!map) return null;
      return kakaoMapsService.addMarker(map, position, options);
    },
    [map],
  );

  const drawCircle = useCallback(
    (center: { lat: number; lng: number }, radius: number, color?: string) => {
      if (!map) return null;
      return kakaoMapsService.drawCircle(map, center, radius, color);
    },
    [map],
  );

  const fitBounds = useCallback(
    (positions: { lat: number; lng: number }[]) => {
      if (!map || positions.length === 0) return;
      kakaoMapsService.fitBounds(map, positions);
    },
    [map],
  );

  return {
    map,
    loading,
    error,
    addMarker,
    drawCircle,
    fitBounds,
  };
}
