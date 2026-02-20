/**
 * Kakao Maps Service
 * Handles address searching, geocoding, and map interactions
 */

export interface Location {
  lat: number;
  lng: number;
}

export interface GeocodeResult {
  address: string;
  location: Location;
}

export interface AddressSearchResult {
  addressName: string;
  roadAddressName: string;
  x: string;
  y: string;
  buildingName?: string;
  district?: string;
}

export interface Place {
  name: string;
  address: string;
  roadAddress: string;
  phone?: string;
  distance: number;
  x: number;
  y: number;
}

class KakaoMapsService {
  private apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
  private scriptId = 'kakao-maps-script';
  private isLoaded = false;
  private geocoder: any = null;
  private places: any = null;

  /**
   * Initialize and load Kakao Maps API
   */
  async initialize(): Promise<boolean> {
    if (this.isLoaded) return true;

    try {
      // Check if already loaded in window
      const kakao = (window as any).kakao;
      if (kakao?.maps?.services?.Geocoder) {
        this.geocoder = new kakao.maps.services.Geocoder();
        this.places = new kakao.maps.services.Places();
        this.isLoaded = true;
        console.log('✅ Kakao Maps services already available');
        return true;
      }

      // Check if script is already being loaded
      if (document.getElementById(this.scriptId)) {
        console.log('⏳ Kakao Maps script already loading, waiting...');
        return this.waitForKakaoServices();
      }

      // Load the main script (without libraries parameter - we'll load them separately)
      console.log('📥 Loading Kakao Maps script...');
      const script = document.createElement('script');
      script.id = this.scriptId;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${this.apiKey}`;
      script.async = false; // Set to false to ensure proper load order

      return new Promise((resolve, reject) => {
        script.onload = () => {
          console.log('✅ Kakao Maps main script loaded');
          // Now load services library separately
          this.loadServicesLibrary().then(success => {
            if (success) {
              this.waitForKakaoServices().then(ready => {
                resolve(ready);
              });
            } else {
              reject(new Error('Failed to load services library'));
            }
          });
        };

        script.onerror = () => {
          reject(new Error('Failed to load Kakao Maps script'));
        };

        document.head.appendChild(script);
      });
    } catch (error) {
      console.error('❌ Kakao Maps initialization error:', error);
      throw error;
    }
  }

  /**
   * Load services library separately
   */
  private loadServicesLibrary(): Promise<boolean> {
    return new Promise((resolve) => {
      const kakao = (window as any).kakao;
      
      // Check if services already loaded
      if (kakao?.maps?.services?.Geocoder) {
        console.log('✅ Services library already available');
        resolve(true);
        return;
      }

      console.log('📦 Loading Kakao Maps services library...');
      const script = document.createElement('script');
      script.src = 'https://t1.daumcdn.net/mapjsapi/js/libs/services/1.0.2/services.js';
      script.async = true;

      script.onload = () => {
        console.log('✅ Services library script loaded');
        resolve(true);
      };

      script.onerror = () => {
        console.error('❌ Failed to load services library');
        resolve(false);
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Wait for Kakao Maps services to be available
   */
  private waitForKakaoServices(): Promise<boolean> {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 300; // 30 seconds with 100ms intervals (for two scripts to load)
      
      const checkInterval = setInterval(() => {
        attempts++;
        const kakao = (window as any).kakao;
        
        // Check for both main maps and services library
        if (kakao?.maps && kakao?.maps?.services?.Geocoder && kakao?.maps?.services?.Places) {
          clearInterval(checkInterval);
          try {
            this.geocoder = new kakao.maps.services.Geocoder();
            this.places = new kakao.maps.services.Places();
            this.isLoaded = true;
            console.log('✅ Kakao Maps services initialized successfully (attempt:', attempts, ')');
            resolve(true);
          } catch (err) {
            console.error('❌ Error creating services instances:', err);
            resolve(false);
          }
          return;
        }

        // Log progress
        if (attempts % 50 === 0) {
          console.log('⏳ Waiting for Kakao services... (attempt:', attempts, ')');
        }

        // Timeout
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          const state = {
            hasKakao: !!kakao,
            hasMaps: !!kakao?.maps,
            hasServices: !!kakao?.maps?.services,
            hasGeocoder: !!kakao?.maps?.services?.Geocoder,
            hasPlaces: !!kakao?.maps?.services?.Places,
          };
          console.error('❌ Kakao services timeout. State:', state);
          resolve(false);
        }
      }, 100);
    });
  }

  /**
   * Search for address using Kakao Maps JS SDK Geocoder
   */
  async searchAddress(query: string): Promise<AddressSearchResult[]> {
    try {
      if (!query.trim()) {
        throw new Error('검색어가 비어있습니다.');
      }

      console.log('🔍 Searching for address:', query);

      // Ensure services are loaded
      if (!this.isLoaded || !this.geocoder) {
        console.log('⏳ Services not ready, initializing...');
        const success = await this.initialize();
        if (!success || !this.geocoder) {
          throw new Error('Kakao Maps Geocoder service unavailable. Try refreshing the page.');
        }
      }

      return new Promise((resolve, reject) => {
        console.log('📍 Calling Kakao addressSearch...');
        this.geocoder.addressSearch(query, (result: any[], status: string) => {
          console.log('📊 addressSearch result. Status:', status, 'Results:', result?.length || 0);

          if (status === 'OK' && result && result.length > 0) {
            const formatted = result.map((doc: any) => ({
              addressName: doc.address_name || doc.road_address_name,
              roadAddressName: doc.road_address_name || doc.address_name,
              x: doc.x,
              y: doc.y,
              buildingName: doc.building_name,
              district: this.extractDistrict(doc.address_name || doc.road_address_name),
            }));
            console.log('✅ Address search successful:', formatted);
            resolve(formatted);
          } else if (status === 'ZERO_RESULT') {
            console.log('⚠️ No addresses found for:', query);
            resolve([]);
          } else {
            console.error('❌ Kakao addressSearch error. Status:', status);
            reject(new Error(`주소 검색 실패 (상태: ${status})`));
          }
        });
      });
    } catch (error) {
      console.error('❌ Address search error:', error);
      throw error;
    }
  }

  /**
   * Search for places (keyword search) using Kakao Maps JS SDK Places
   */
  async searchPlaces(
    keyword: string,
    lat?: number,
    lng?: number,
    radius = 1000,
  ): Promise<Place[]> {
    try {
      if (!keyword.trim()) {
        throw new Error('검색어가 비어있습니다.');
      }

      console.log('🔍 Searching for places:', keyword);

      // Ensure services are loaded
      if (!this.isLoaded || !this.places) {
        console.log('⏳ Services not ready, initializing...');
        const success = await this.initialize();
        if (!success || !this.places) {
          throw new Error('Kakao Maps Places service unavailable. Try refreshing the page.');
        }
      }

      return new Promise((resolve, reject) => {
        try {
          const options: any = {
            query: keyword,
            size: 15,
          };

          if (lat && lng) {
            const kakao = (window as any).kakao;
            options.location = new kakao.maps.LatLng(lat, lng);
            options.radius = radius;
          }

          console.log('🏪 Calling Kakao keywordSearch...');
          this.places.keywordSearch(options, (result: any[], status: string) => {
            console.log('📊 keywordSearch result. Status:', status, 'Results:', result?.length || 0);

            if (status === 'OK' && result && result.length > 0) {
              const formatted = result.map((doc: any) => ({
                name: doc.place_name,
                address: doc.address_name,
                roadAddress: doc.road_address_name || doc.address_name,
                phone: doc.phone,
                distance: doc.distance ? parseInt(doc.distance) : 0,
                x: parseFloat(doc.x),
                y: parseFloat(doc.y),
              }));
              console.log('✅ Place search successful:', formatted.length, 'places found');
              resolve(formatted);
            } else if (status === 'ZERO_RESULT') {
              console.log('⚠️ No places found for:', keyword);
              resolve([]);
            } else {
              console.error('❌ Kakao keywordSearch error. Status:', status);
              reject(new Error(`장소 검색 실패 (상태: ${status})`));
            }
          });
        } catch (error) {
          console.error('Error calling keywordSearch:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('Place search error:', error);
      throw error;
    }
  }

  /**
   * Geocode: get coordinates from address
   */
  async geocode(address: string): Promise<GeocodeResult> {
    try {
      const results = await this.searchAddress(address);

      if (results.length === 0) {
        throw new Error('주소를 찾을 수 없습니다.');
      }

      const result = results[0];
      return {
        address: result.roadAddressName || result.addressName,
        location: {
          lat: parseFloat(result.y),
          lng: parseFloat(result.x),
        },
      };
    } catch (error) {
      console.error('Geocoding failed:', error);
      throw error;
    }
  }

  /**
   * Reverse geocode: get address from coordinates using Kakao Maps JS SDK
   */
  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
    try {
      console.log('🔍 Reverse geocoding:', lat, lng);

      // Ensure services are loaded
      if (!this.isLoaded || !this.geocoder) {
        console.log('⏳ Services not ready, initializing...');
        const success = await this.initialize();
        if (!success || !this.geocoder) {
          throw new Error('Kakao Maps Geocoder service unavailable. Try refreshing the page.');
        }
      }

      return new Promise((resolve, reject) => {
        console.log('📍 Calling Kakao coord2Address...');
        this.geocoder.coord2Address(lng, lat, (result: any[], status: string) => {
          console.log('📊 coord2Address result. Status:', status, 'Results:', result?.length || 0);

          if (status === 'OK' && result && result.length > 0) {
            const doc = result[0];
            const address = doc.address?.address_name || doc.road_address?.address_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            console.log('✅ Reverse geocoding successful:', address);
            resolve({
              address,
              location: { lat, lng },
            });
          } else if (status === 'ZERO_RESULT') {
            const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            console.log('⚠️ No address found, returning coordinates:', coords);
            resolve({
              address: coords,
              location: { lat, lng },
            });
          } else {
            console.error('❌ Kakao coord2Address error. Status:', status);
            reject(new Error(`주소 검색 실패 (상태: ${status})`));
          }
        });
      });
    } catch (error) {
      console.error('❌ Reverse geocoding error:', error);
      throw error;
    }
  }

  /**
   * Create and display a map
   */
  async createMap(
    containerId: string,
    options?: {
      center?: Location;
      level?: number;
    },
  ): Promise<any> {
    await this.initialize();

    const kakao = (window as any).kakao;
    if (!kakao?.maps) {
      throw new Error('Kakao Maps API not initialized');
    }

    const defaultCenter =
      options?.center || { lat: 37.5665, lng: 126.978 }; // Seoul

    const map = new kakao.maps.Map(document.getElementById(containerId), {
      center: new kakao.maps.LatLng(defaultCenter.lat, defaultCenter.lng),
      level: options?.level || 3,
    });

    return map;
  }

  /**
   * Add marker to map
   */
  addMarker(
    map: any,
    position: Location,
    options?: {
      title?: string;
      image?: string;
    },
  ): any {
    const kakao = (window as any).kakao;
    if (!kakao?.maps) {
      throw new Error('Kakao Maps API not initialized');
    }

    const marker = new kakao.maps.Marker({
      map,
      position: new kakao.maps.LatLng(position.lat, position.lng),
      title: options?.title,
    });

    if (options?.image) {
      const image = new kakao.maps.MarkerImage(
        options.image,
        new kakao.maps.Size(64, 69),
        {
          offset: new kakao.maps.Point(32, 69),
        },
      );
      marker.setImage(image);
    }

    return marker;
  }

  /**
   * Draw circle on map
   */
  drawCircle(
    map: any,
    center: Location,
    radius: number,
    color = '#FF0000',
  ): any {
    const kakao = (window as any).kakao;
    if (!kakao?.maps) {
      throw new Error('Kakao Maps API not initialized');
    }

    const circle = new kakao.maps.Circle({
      center: new kakao.maps.LatLng(center.lat, center.lng),
      radius,
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeStyle: 'dashed',
      fillColor: color,
      fillOpacity: 0.1,
    });

    circle.setMap(map);
    return circle;
  }

  /**
   * Fit map bounds to show all markers
   */
  fitBounds(map: any, positions: Location[]): void {
    const kakao = (window as any).kakao;
    if (!kakao?.maps || positions.length === 0) return;

    const bounds = new kakao.maps.LatLngBounds();

    positions.forEach((pos) => {
      bounds.extend(new kakao.maps.LatLng(pos.lat, pos.lng));
    });

    map.setBounds(bounds);
  }

  /**
   * Extract district (구) from address
   */
  private extractDistrict(address: string): string {
    const parts = address.split(' ');
    // Usually format is: 도/시 구/군 동/읍면
    return parts.length >= 2 ? parts[1] : '';
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export const kakaoMapsService = new KakaoMapsService();
