import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as querystring from 'querystring';

export interface BusinessInfo {
  name: string;
  registrationNumber: string;
  status: string;
  address: string;
  phone?: string;
}

@Injectable()
export class PublicDataService {
  private readonly baseUrl = process.env.PUBLIC_DATA_API_BASE_URL || 'https://apis.data.go.kr';
  private readonly apiKey = process.env.PUBLIC_DATA_API_KEY || '';
  private readonly nodeEnv = process.env.NODE_ENV || 'development';

  async getBusinessInfo(registrationNumber: string): Promise<BusinessInfo> {
    // Use mock data in development mode or when API key is not configured
    if (this.nodeEnv === 'development' || !this.apiKey || this.apiKey.trim() === '') {
      return this.getMockBusinessInfo(registrationNumber);
    }

    try {
      const params = {
        serviceKey: this.apiKey,
        returnType: 'json',
        b_no: registrationNumber.replace(/-/g, ''),
      };

      const response = await axios.get(
        `${this.baseUrl}/B552015/V1Service_B000001/getCompanyInfo`,
        { params },
      );

      if (!response.data.body || response.data.body.totalCnt === 0) {
        throw new BadRequestException('Business not found');
      }

      const company = response.data.body.items[0];

      return {
        name: company.b_svc_nm,
        registrationNumber,
        status: company.b_stt_cd === '01' ? 'active' : 'inactive',
        address: company.b_addr,
        phone: company.b_tel,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Business lookup failed: ${errorMessage}`);
    }
  }

  private getMockBusinessInfo(registrationNumber: string): BusinessInfo {
    // Return dummy data for local development
    const cleanNumber = registrationNumber.replace(/-/g, '');
    
    // Generate consistent mock data based on registration number
    const mockCompanies: Record<string, BusinessInfo> = {
      '1234567890': {
        name: '(주)핀테크솔루션',
        registrationNumber,
        status: 'active',
        address: '서울시 강남구 테헤란로 123, KT선릉타워',
        phone: '02-123-4567',
      },
      '1234567865': {
        name: 'Umarawa Inc.',
        registrationNumber,
        status: 'active',
        address: '서울시 종로구 계동길 45, 창덕궁타워',
        phone: '02-987-6543',
      },
    };

    // Return mock data if exists, otherwise generate generic data
    if (mockCompanies[cleanNumber]) {
      return mockCompanies[cleanNumber];
    }

    // Generic mock data for any business number
    return {
      name: `사업자(${cleanNumber.slice(0, 3)}-${cleanNumber.slice(3, 5)}-${cleanNumber.slice(5)})`,
      registrationNumber,
      status: 'active',
      address: '서울시 강남구 테헤란로 100번길',
      phone: '02-555-1234',
    };
  }

  async verifyBusinessRegistration(registrationNumber: string): Promise<boolean> {
    try {
      const info = await this.getBusinessInfo(registrationNumber);
      return info.status === 'active';
    } catch {
      return false;
    }
  }
}
