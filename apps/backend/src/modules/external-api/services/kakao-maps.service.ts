import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

export interface Location {
  lat: number;
  lng: number;
}

export interface GeocodeResult {
  address: string;
  location: Location;
}

@Injectable()
export class KakaoMapsService {
  private readonly apiUrl = 'https://dapi.kakao.com/v2/local';
  private readonly apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || '';

  async geocode(address: string): Promise<GeocodeResult> {
    try {
      const response = await axios.get(`${this.apiUrl}/search/address.json`, {
        params: { query: address },
        headers: { Authorization: `KakaoAK ${this.apiKey}` },
      });

      if (response.data.documents.length === 0) {
        throw new BadRequestException('Address not found');
      }

      const doc = response.data.documents[0];
      return {
        address: doc.address_name,
        location: {
          lat: parseFloat(doc.y),
          lng: parseFloat(doc.x),
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Geocoding failed: ${errorMessage}`);
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
    try {
      const response = await axios.get(`${this.apiUrl}/geo/coord2address.json`, {
        params: { x: lng, y: lat },
        headers: { Authorization: `KakaoAK ${this.apiKey}` },
      });

      if (!response.data.documents || response.data.documents.length === 0) {
        throw new BadRequestException('Location not found');
      }

      const doc = response.data.documents[0];
      return {
        address: doc.address.address_name,
        location: { lat, lng },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Reverse geocoding failed: ${errorMessage}`);
    }
  }

  async searchNearby(lat: number, lng: number, keyword: string, radius = 1000) {
    try {
      const response = await axios.get(`${this.apiUrl}/search/keyword.json`, {
        params: {
          x: lng,
          y: lat,
          query: keyword,
          radius,
        },
        headers: { Authorization: `KakaoAK ${this.apiKey}` },
      });

      return response.data.documents;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Nearby search failed: ${errorMessage}`);
    }
  }
}
