# Kakao Maps Integration Guide - Finnova Web

## Overview
Complete Kakao Maps integration for the Finnova web application including address search, geocoding, and property valuation visualization.

## Components & Hooks

### 1. **Kakao Maps Service** (`services/kakaoMaps.service.ts`)
Core service handling all Kakao Maps API interactions.

#### Methods:
- `initialize()` - Load Kakao Maps script
- `searchAddress(query)` - Search addresses
- `searchPlaces(keyword, lat?, lng?, radius?)` - Search places
- `geocode(address)` - Get coordinates from address
- `reverseGeocode(lat, lng)` - Get address from coordinates
- `createMap(containerId, options)` - Create map instance
- `addMarker(map, position, options)` - Add marker to map
- `drawCircle(map, center, radius, color)` - Draw circle on map
- `fitBounds(map, positions)` - Fit map to show all positions

### 2. **React Hooks** (`hooks/useKakaoMaps.ts`)

#### `useAddressSearch()`
Search for addresses with debouncing.
```typescript
const { query, setQuery, results, loading, error, search, selectAddress } = useAddressSearch();
```

#### `useGeocoding()`
Geocode and reverse geocode functionality.
```typescript
const { loading, error, geocode, reverseGeocode } = useGeocoding();
```

#### `usePlaceSearch()`
Search for places (restaurants, banks, etc.).
```typescript
const { query, setQuery, results, loading, error, search } = usePlaceSearch();
```

#### `useKakaoMap(containerId)`
Create and manage map instances.
```typescript
const { map, loading, error, addMarker, drawCircle, fitBounds } = useKakaoMap(containerId);
```

### 3. **React Components**

#### `AddressSearch`
Address search input with dropdown results.

**Props:**
```typescript
{
  onSelectAddress: (address: string, lat: number, lng: number) => void;
  placeholder?: string;
  disabled?: boolean;
  defaultValue?: string;
}
```

**Usage:**
```tsx
<AddressSearch
  onSelectAddress={(address, lat, lng) => {
    setAddress(address);
    setCoordinates({ lat, lng });
  }}
  placeholder="찾는 주소을 입력하세요"
  defaultValue="서울시 강남구"
/>
```

#### `MapDisplay`
Display map with markers and circles.

**Props:**
```typescript
{
  markers?: Array<{
    lat: number;
    lng: number;
    title?: string;
    onClick?: () => void;
  }>;
  center?: { lat: number; lng: number };
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
```

**Usage:**
```tsx
<MapDisplay
  markers={[
    { lat: 37.4979, lng: 127.039, title: '강남역' }
  ]}
  circles={[
    { lat: 37.4979, lng: 127.039, radius: 1000, color: '#FF0000' }
  ]}
  height="h-96"
/>
```

#### `PropertyValuation`
Display property valuation and validation results.

**Props:**
```typescript
{
  address: string;
  claimedValue?: number;
  onValidation?: (result: any) => void;
  readOnly?: boolean;
}
```

**Usage:**
```tsx
<PropertyValuation
  address={address}
  claimedValue={collateralValue}
  onValidation={(result) => {
    console.log('Validation result:', result);
  }}
/>
```

## Integration with Loan Application Form

### Example: Adding Address Search to Loan Form

```tsx
'use client';

import { useState } from 'react';
import AddressSearch from '@/components/AddressSearch';
import MapDisplay from '@/components/MapDisplay';
import PropertyValuation from '@/components/PropertyValuation';

export default function LoanApplicationForm() {
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<{lat: number; lng: number} | null>(null);
  const [collateralValue, setCollateralValue] = useState(0);

  const handleAddressSelect = (selectedAddress: string, lat: number, lng: number) => {
    setAddress(selectedAddress);
    setCoordinates({ lat, lng });
  };

  return (
    <div className="space-y-6">
      {/* Address Search */}
      <div>
        <label className="block text-sm font-medium mb-2">담보 주소</label>
        <AddressSearch
          onSelectAddress={handleAddressSelect}
          placeholder="담보 주소를 검색하세요"
        />
      </div>

      {/* Map Display - Optional */}
      {coordinates && (
        <MapDisplay
          markers={[
            {
              lat: coordinates.lat,
              lng: coordinates.lng,
              title: address,
            }
          ]}
          center={coordinates}
          height="h-64"
        />
      )}

      {/* Collateral Value Input */}
      <div>
        <label className="block text-sm font-medium mb-2">담보 평가액</label>
        <input
          type="number"
          value={collateralValue}
          onChange={(e) => setCollateralValue(Number(e.target.value))}
          placeholder="담보 평가액을 입력하세요"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Property Valuation - Optional */}
      {address && (
        <PropertyValuation
          address={address}
          claimedValue={collateralValue}
          onValidation={(result) => {
            if (!result.isValid) {
              alert(`⚠️ ${result.message}`);
            }
          }}
        />
      )}
    </div>
  );
}
```

## Backend Integration

### Property Valuation Endpoints

#### 1. Get Property Valuation
```typescript
GET /api/loans/property/valuation?address=서울시%20강남구%20역삼동

Response:
{
  success: true,
  data: {
    address: string;
    propertyType: string;
    recentTransactions: RealEstateTransaction[];
    averagePrice: number;
    unitPrice: number;
    marketTrend: 'rising' | 'stable' | 'falling';
    transactionFrequency: number;
    estimatedValue: number;
  }
}
```

#### 2. Validate Collateral
```typescript
POST /api/loans/property/validate

Request Body:
{
  address: string;
  claimedValue: number;
}

Response:
{
  success: true,
  data: {
    isValid: boolean;
    marketEstimate: number;
    claimedValue: number;
    variance: number;
    variancePercent: number;
    status: 'acceptable' | 'overvalued' | 'undervalued' | 'unverifiable';
    message: string;
  }
}
```

## Data Sources

### Primary Data Sources
1. **data.go.kr** - Real estate transaction data
2. **Kakao Maps API** - Address search and geocoding
3. **KB Price API** (future) - Professional property valuation

### Fallback Behavior
- Components use mock data in development mode
- Graceful degradation if APIs are unavailable
- User-provided values used when external data unavailable

## Environment Variables

```env
# Frontend
NEXT_PUBLIC_KAKAO_MAP_API_KEY=<your_kakao_api_key>

# Backend
PUBLIC_DATA_API_BASE_URL=https://apis.data.go.kr
PUBLIC_DATA_API_KEY=<your_public_data_api_key>
KB_PRICE_API_URL=https://api.kb.co.kr
KB_PRICE_API_KEY=<your_kb_api_key>
```

## Features

### Current Features
✅ Address search with autocomplete
✅ Map display with markers
✅ Circle radius visualization
✅ Geocoding and reverse geocoding
✅ Property valuation lookup
✅ Collateral validation
✅ Market trend analysis
✅ Transaction history display
✅ Responsive design
✅ Error handling and fallbacks

### Planned Features
🔄 Advanced filtering and sorting
🔄 Address comparison tool
🔄 Historical price chart
🔄 Area demographics
🔄 Property crime/risk data
🔄 Offline caching
🔄 Multi-language support

## Performance Optimizations

1. **Debounced Search** - 300ms debounce on address input
2. **Lazy Script Loading** - Kakao Maps loaded on-demand
3. **Memoization** - React hooks use useMemo and useCallback
4. **Error Boundaries** - Graceful error handling
5. **Caching** - Results cached in component state

## Troubleshooting

### Map not loading
- Verify `NEXT_PUBLIC_KAKAO_MAP_API_KEY` is set in `.env.local`
- Check browser console for API key errors
- Ensure container element exists with correct ID

### Address search returning no results
- Verify address format (e.g., "서울시 강남구")
- Check PUBLIC_DATA_API_KEY in backend
- Review data.go.kr API status

### Validation always "unverifiable"
- Ensure PUBLIC_DATA_API_KEY is valid
- Check address format matches data.go.kr standards
- Review server logs for API errors

## Testing

### Manual Testing Checklist
- [ ] Address search returns correct results
- [ ] Map displays at correct coordinates
- [ ] Markers appear and are clickable
- [ ] Property valuation loads correctly
- [ ] Collateral validation compares values
- [ ] Error states display properly
- [ ] Mobile responsive layout works
- [ ] Keyboard navigation works

### Test Address Examples
```
서울시 강남구 역삼동 123
신분당선 강남역 주변
서울시 종로구 청와대길 1
```

## Related Documentation
- [Kakao Maps API Docs](https://apis.map.kakao.com/)
- [data.go.kr API Guide](https://www.data.go.kr/)
- [Loan Module Documentation](../../docs/loan-module.md)
- [Backend API Reference](../../docs/api-reference.md)
