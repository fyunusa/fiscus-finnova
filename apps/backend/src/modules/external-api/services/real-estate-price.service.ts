import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

export interface RealEstatePrice {
  address: string;
  price: number;
  pricePerSqm: number;
  pricePerPyeong: number;
  lastUpdated: Date;
}

@Injectable()
export class RealEstatePriceService {
  private readonly kbApiUrl = process.env.KB_PRICE_API_URL || 'https://api.kb.co.kr';
  private readonly kbApiKey = process.env.KB_PRICE_API_KEY || '';

  async getPropertyPrice(address: string): Promise<RealEstatePrice> {
    try {
      const response = await axios.get(`${this.kbApiUrl}/v1/property/price`, {
        params: {
          address,
          apikey: this.kbApiKey,
        },
      });

      if (!response.data.result) {
        throw new BadRequestException('Property not found');
      }

      const data = response.data.result;
      return {
        address,
        price: data.price,
        pricePerSqm: data.price_per_sqm,
        pricePerPyeong: data.price_per_pyeong,
        lastUpdated: new Date(data.last_updated),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Real estate price lookup failed: ${errorMessage}`);
    }
  }

  async getAreaPrices(lat: number, lng: number, radius = 1000): Promise<RealEstatePrice[]> {
    try {
      const response = await axios.get(`${this.kbApiUrl}/v1/property/area-prices`, {
        params: {
          lat,
          lng,
          radius,
          apikey: this.kbApiKey,
        },
      });

      return response.data.results || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Area price lookup failed: ${errorMessage}`);
    }
  }

  async getPriceHistory(address: string, months = 12): Promise<any[]> {
    try {
      const response = await axios.get(`${this.kbApiUrl}/v1/property/price-history`, {
        params: {
          address,
          months,
          apikey: this.kbApiKey,
        },
      });

      return response.data.results || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Price history lookup failed: ${errorMessage}`);
    }
  }
}
