'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useAddressSearch } from '@/hooks/useKakaoMaps';

interface AddressSearchProps {
  onSelectAddress: (address: string, lat: number, lng: number) => void;
  placeholder?: string;
  disabled?: boolean;
  defaultValue?: string;
}

export function AddressSearch({
  onSelectAddress,
  placeholder = '주소를 검색하세요',
  disabled = false,
  defaultValue = '',
}: AddressSearchProps) {
  const [showResults, setShowResults] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(defaultValue);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const { query, setQuery, results, loading, error, search, selectAddress } =
    useAddressSearch();

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        search(query);
        setShowResults(true);
      } else {
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (result: any) => {
    console.log('🔍 Result selected from dropdown:', {
      buildingName: result.buildingName,
      roadAddressName: result.roadAddressName,
      addressName: result.addressName,
      x: result.x,
      y: result.y,
    });
    const selected = selectAddress(result);
    console.log('📍 selectAddress returned:', selected);
    setSelectedAddress(result.roadAddressName || result.addressName);
    setQuery('');
    setShowResults(false);
    console.log('📤 Calling onSelectAddress with:', { address: selected.address, lat: selected.lat, lng: selected.lng });
    onSelectAddress(selected.address, selected.lat, selected.lng);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedAddress('');
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder={placeholder}
          value={query || selectedAddress}
          onChange={handleInputChange}
          onFocus={() => query && setShowResults(true)}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && (
        <div
          ref={resultsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {loading && (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin inline-block" />
              <span className="ml-2">검색 중...</span>
            </div>
          )}

          {error && (
            <div className="p-4 text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && results.length === 0 && query && !error && (
            <div className="p-4 text-center text-gray-500">
              검색 결과가 없습니다
            </div>
          )}

          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelectResult(result)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 break-words">
                    {result.buildingName && (
                      <span className="text-blue-600">{result.buildingName} </span>
                    )}
                    {result.roadAddressName || result.addressName}
                  </div>
                  {result.roadAddressName && result.addressName !== result.roadAddressName && (
                    <div className="text-sm text-gray-500 break-words">
                      지번: {result.addressName}
                    </div>
                  )}
                  {result.district && (
                    <div className="text-xs text-gray-400 mt-1">
                      {result.district}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default AddressSearch;
