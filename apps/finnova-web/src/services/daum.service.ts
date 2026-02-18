/**
 * Daum Postcode API Service
 * Handles address search functionality using Daum's postcode API
 */

// Type definition for Daum Postcode response
export interface DaumPostcodeData {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  bname: string;
  buildingName: string;
  apartment: string;
  userSelectedType: 'R' | 'J';
}

// Formatted address response
export interface AddressSearchResult {
  postcode: string;
  address: string;
  detailAddress?: string; // Building name or suggested detail
  buildingName?: string;
  bname?: string;
  selectedType: 'R' | 'J';
}

/**
 * Load Daum Postcode script dynamically
 */
export function loadDaumPostcodeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (typeof (window as any).daum !== 'undefined') {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    
    script.onload = () => {
      console.log('✅ Daum Postcode script loaded successfully');
      resolve();
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load Daum Postcode script');
      reject(new Error('Failed to load Daum Postcode script'));
    };

    document.body.appendChild(script);
  });
}

/**
 * Format address with building name and extra information
 */
function formatAddressWithExtra(data: DaumPostcodeData): string {
  let fullAddress = '';
  let extraAddress = '';

  if (data.userSelectedType === 'R') {
    // Road address
    fullAddress = data.roadAddress;
    
    if (data.bname && /[동|로|가]$/g.test(data.bname)) {
      extraAddress += data.bname;
    }
    
    if (data.buildingName && data.apartment === 'Y') {
      extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
    }
    
    if (extraAddress) {
      fullAddress += ` (${extraAddress})`;
    }
  } else {
    // Jibun address
    fullAddress = data.jibunAddress;
  }

  return fullAddress;
}

/**
 * Open Daum Postcode modal and handle address selection
 */
export async function openAddressSearch(): Promise<AddressSearchResult> {
  try {
    // Ensure script is loaded
    await loadDaumPostcodeScript();

    // Check if Daum API is available
    if (typeof (window as any).daum === 'undefined') {
      throw new Error('Daum Postcode API is not available');
    }

    return new Promise((resolve, reject) => {
      new (window as any).daum.Postcode({
        oncomplete: (data: DaumPostcodeData) => {
          const formattedAddress = formatAddressWithExtra(data);
          
          // Use building name as suggested detail address if available
          const suggestedDetailAddress = data.buildingName || '';
          
          console.log('📍 Address selected:', {
            postcode: data.zonecode,
            address: formattedAddress,
            detailAddress: suggestedDetailAddress,
            selectedType: data.userSelectedType,
          });

          const result: AddressSearchResult = {
            postcode: data.zonecode,
            address: formattedAddress,
            detailAddress: suggestedDetailAddress,
            buildingName: data.buildingName,
            bname: data.bname,
            selectedType: data.userSelectedType,
          };

          resolve(result);
        },
        onresize: (size: { height: number }) => {
          // Handle modal resize if needed
        },
        width: '100%',
        height: '100%',
      }).open();
    });
  } catch (error) {
    console.error('❌ Address search error:', error);
    throw error;
  }
}

/**
 * Check if Daum API is available
 */
export function isDaumAvailable(): boolean {
  return typeof (window as any).daum !== 'undefined';
}
