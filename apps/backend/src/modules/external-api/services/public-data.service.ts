import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import axios from 'axios';
import * as querystring from 'querystring';

export interface BusinessInfo {
  name: string;
  registrationNumber: string;
  status: string;
  address: string;
  phone?: string;
}

// Real Estate Data Interfaces
export interface RealEstateTransaction {
  transactionDate: string;
  price: number;
  address: string;
  addressDetail: string;
  propertyType: string;
  area: number;
  floor: number;
  unit: string;
}

export interface ApartmentInfo {
  complexName: string;
  address: string;
  buildYear: number;
  totalHouseholds: number;
  totalArea: number;
  area: number;
  addressCode: string;
  latitude: number;
  longitude: number;
}

export interface LandInfo {
  landAddress: string;
  landArea: number;
  totalPrice: number;
  unitPrice: number;
  exchangeableYn: string;
  contractingCounty: string;
}

export interface PropertyValuationData {
  address: string;
  propertyType: string; // apartment, land, building, etc
  recentTransactions: RealEstateTransaction[];
  averagePrice: number;
  unitPrice: number;
  marketTrend: string; // rising, stable, falling
  transactionFrequency: number;
  estimatedValue: number;
}

@Injectable()
export class PublicDataService {
  private readonly logger = new Logger(PublicDataService.name);
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

  // ============ REAL ESTATE DATA METHODS ============

  /**
   * Get real estate transaction history by area and month
   * Used to analyze historical price trends for property valuation
   *
   * @param dealYmd - Year-Month in format YYYYMM (e.g., 202601)
   * @param givenArea - Area code (시군구 코드)
   * @returns Array of recent transactions
   */
  async getRealEstateTransactions(
    dealYmd: string,
    givenArea: string,
  ): Promise<RealEstateTransaction[]> {
    try {
      if (this.nodeEnv === 'development' || !this.apiKey) {
        return this.getMockTransactions(givenArea);
      }

      // data.go.kr requires specific service endpoint
      const serviceUrl = `${this.baseUrl}/openapi/service/rest/ArpltnInfoService/getRealEstateTransactionList`;

      const response = await axios.get(serviceUrl, {
        params: {
          serviceKey: this.apiKey,
          LAWD_CD: givenArea,
          DEAL_YMD: dealYmd,
          numOfRows: 100,
          pageNo: 1,
          type: 'json',
        },
      });

      const transactions = this.parseTransactionResponse(response.data);
      this.logger.log(`Retrieved ${transactions.length} transactions for area ${givenArea}`);

      return transactions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get real estate transactions: ${errorMessage}`);
      // Return mock data as fallback
      return this.getMockTransactions(givenArea);
    }
  }

  /**
   * Get apartment complex sales information
   * Queries reported apartment sales from data.go.kr
   *
   * @param dealYmd - Year-Month in format YYYYMM
   * @param givenArea - Area code
   * @returns Array of apartment sales data
   */
  async getApartmentSalesData(dealYmd: string, givenArea: string): Promise<any[]> {
    try {
      if (this.nodeEnv === 'development' || !this.apiKey) {
        return this.getMockAppartmentSales();
      }

      const serviceUrl = `${this.baseUrl}/openapi/service/rest/ArpltnSalesService/getSalesListGTDC`;

      const response = await axios.get(serviceUrl, {
        params: {
          serviceKey: this.apiKey,
          LAWD_CD: givenArea,
          DEAL_YMD: dealYmd,
          numOfRows: 100,
          pageNo: 1,
          type: 'json',
        },
      });

      const sales = this.parseSalesResponse(response.data);
      this.logger.log(`Retrieved apartment sales data for area ${givenArea}`);

      return sales;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get apartment sales data: ${errorMessage}`);
      return this.getMockAppartmentSales();
    }
  }

  /**
   * Get property information and valuation by address
   * Aggregates transaction data for professional property assessment
   *
   * @param address - Full Korean address string
   * @returns Property valuation data and transaction history
   */
  async getPropertyByAddress(address: string): Promise<PropertyValuationData | null> {
    try {
      // Convert address to area code
      const areaCode = this.getAreaCodeByAddress(address);
      if (!areaCode) {
        this.logger.warn(`Could not find area code for address: ${address}`);
        return null;
      }

      // Get recent transactions for this area
      const currentMonth = new Date();
      const dealYmd = `${currentMonth.getFullYear()}${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

      const transactions = await this.getRealEstateTransactions(dealYmd, areaCode);

      if (transactions.length === 0) {
        this.logger.warn(`No transactions found for address: ${address}`);
        return null;
      }

      // Filter by address match
      const addressParts = address.split(' ').slice(0, 3).join(' ');
      const matchingTransactions = transactions.filter(
        (t) =>
          t.address.includes(addressParts) ||
          address.includes(t.address),
      );

      // Calculate property valuation data
      const valuationData = this.calculatePropertyValuation(
        address,
        matchingTransactions.length > 0 ? matchingTransactions : transactions.slice(0, 20),
      );

      return valuationData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get property valuation: ${errorMessage}`);
      throw new BadRequestException(`Failed to get property information: ${errorMessage}`);
    }
  }

  /**
   * Get land transaction data
   * Provides information about land sales by area
   *
   * @param dealYmd - Year-Month in format YYYYMM
   * @param givenArea - Area code
   * @returns Land transaction data
   */
  async getLandTransactions(dealYmd: string, givenArea: string): Promise<LandInfo[]> {
    try {
      if (this.nodeEnv === 'development' || !this.apiKey) {
        return this.getMockLandTransactions();
      }

      const serviceUrl = `${this.baseUrl}/openapi/service/rest/LandTransactionService/getLandTransactionList`;

      const response = await axios.get(serviceUrl, {
        params: {
          serviceKey: this.apiKey,
          LAWD_CD: givenArea,
          DEAL_YMD: dealYmd,
          numOfRows: 100,
          pageNo: 1,
          type: 'json',
        },
      });

      const lands = this.parseLandResponse(response.data);
      this.logger.log(`Retrieved land transaction data for area ${givenArea}`);

      return lands;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get land transactions: ${errorMessage}`);
      return this.getMockLandTransactions();
    }
  }

  /**
   * Get apartment complex information
   * Retrieves details about specific apartment complexes
   *
   * @param apartmentName - Name of apartment complex
   * @param givenArea - Area code (optional)
   * @returns Apartment complex details
   */
  async getApartmentComplexInfo(
    apartmentName: string,
    givenArea?: string,
  ): Promise<ApartmentInfo[]> {
    try {
      if (this.nodeEnv === 'development' || !this.apiKey) {
        return this.getMockApartmentInfo(apartmentName);
      }

      const serviceUrl = `${this.baseUrl}/openapi/service/rest/ApartmentService/getApartmentList`;

      const params: any = {
        serviceKey: this.apiKey,
        searchType: 'by_name',
        searchWord: apartmentName,
        numOfRows: 50,
        pageNo: 1,
        type: 'json',
      };

      if (givenArea) {
        params.LAWD_CD = givenArea;
      }

      const response = await axios.get(serviceUrl, { params });

      const apartments = this.parseApartmentResponse(response.data);
      this.logger.log(`Retrieved apartment info for ${apartmentName}`);

      return apartments;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get apartment complex info: ${errorMessage}`);
      return this.getMockApartmentInfo(apartmentName);
    }
  }

  // ============ HELPER METHODS ============

  private getAreaCodeByAddress(address: string): string | null {
    // Map Korean districts to area codes (시군구 코드)
    const areaCodeMap: Record<string, string> = {
      // Seoul (서울)
      '강남구': '11680',
      '강동구': '11740',
      '강북구': '11590',
      '강서구': '11500',
      '관악구': '11620',
      '광진구': '11200',
      '구로구': '11530',
      '금천구': '11545',
      '노원구': '11680',
      '도봉구': '11670',
      '동대문구': '11230',
      '동작구': '11630',
      '마포구': '11440',
      '서대문구': '11420',
      '서초구': '11650',
      '성동구': '11210',
      '성북구': '11560',
      '송파구': '11710',
      '양천구': '11470',
      '영등포구': '11560',
      '용산구': '11170',
      '은평구': '11410',
      '종로구': '11110',
      '중구': '11140',
      '중랑구': '11250',
    };

    for (const [district, code] of Object.entries(areaCodeMap)) {
      if (address.includes(district)) {
        return code;
      }
    }

    return null;
  }

  private parseTransactionResponse(data: any): RealEstateTransaction[] {
    try {
      if (!data.response?.body?.items?.item) {
        return [];
      }

      const items = Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];

      return items.map((item: any) => ({
        transactionDate: item.dealYear + item.dealMonth + item.dealDay,
        price: parseInt(item.dealAmount?.replace(/,/g, '') || '0'),
        address: (item.roadAddr || item.jibunAddr || 'Unknown Address') as string,
        addressDetail: (item.buildingName || '') as string,
        propertyType: item.type || 'apartment',
        area: parseFloat(item.area || '0'),
        floor: parseInt(item.floor || '0'),
        unit: item.unit || '',
      }));
    } catch (error) {
      this.logger.error(`Error parsing transaction response: ${error}`);
      return [];
    }
  }

  private parseSalesResponse(data: any): any[] {
    try {
      if (!data.response?.body?.items?.item) {
        return [];
      }

      const items = Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];

      return items.map((item: any) => ({
        transactionDate: item.dealYmd,
        price: parseInt(item.dealAmount?.replace(/,/g, '') || '0'),
        address: item.roadAddr || item.jibunAddr || '',
        buildingName: item.buildingName || '',
        area: parseFloat(item.area || '0'),
        floor: parseInt(item.floor || '0'),
        type: 'apartment',
      }));
    } catch (error) {
      this.logger.error(`Error parsing sales response: ${error}`);
      return [];
    }
  }

  private parseLandResponse(data: any): LandInfo[] {
    try {
      if (!data.response?.body?.items?.item) {
        return [];
      }

      const items = Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];

      return items.map((item: any) => ({
        landAddress: item.roadAddr || item.jibunAddr || '',
        landArea: parseFloat(item.area || '0'),
        totalPrice: parseInt(item.dealAmount?.replace(/,/g, '') || '0'),
        unitPrice: parseInt(item.unitPrice?.replace(/,/g, '') || '0'),
        exchangeableYn: item.exchangeableYn || 'N',
        contractingCounty: item.contractingCounty || '',
      }));
    } catch (error) {
      this.logger.error(`Error parsing land response: ${error}`);
      return [];
    }
  }

  private parseApartmentResponse(data: any): ApartmentInfo[] {
    try {
      if (!data.response?.body?.items?.item) {
        return [];
      }

      const items = Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];

      return items.map((item: any) => ({
        complexName: item.apartmentName || '',
        address: item.roadAddr || item.jibunAddr || '',
        buildYear: parseInt(item.buildYear || '0'),
        totalHouseholds: parseInt(item.householdCount || '0'),
        totalArea: parseFloat(item.totalArea || '0'),
        area: parseFloat(item.area || '0'),
        addressCode: item.addressCode || '',
        latitude: parseFloat(item.latitude || '0'),
        longitude: parseFloat(item.longitude || '0'),
      }));
    } catch (error) {
      this.logger.error(`Error parsing apartment response: ${error}`);
      return [];
    }
  }

  private calculatePropertyValuation(
    address: string,
    transactions: RealEstateTransaction[],
  ): PropertyValuationData {
    if (transactions.length === 0) {
      return {
        address,
        propertyType: 'unknown',
        recentTransactions: [],
        averagePrice: 0,
        unitPrice: 0,
        marketTrend: 'insufficient_data',
        transactionFrequency: 0,
        estimatedValue: 0,
      };
    }

    // Sort by date descending (most recent first)
    const sortedTxns = [...transactions].sort(
      (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime(),
    );

    // Get transactions from last 2 years
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const recentTxns = sortedTxns.filter((t) => new Date(t.transactionDate) >= twoYearsAgo);

    const txnsToAnalyze = recentTxns.length > 0 ? recentTxns : sortedTxns.slice(0, 20);

    // Calculate statistics
    const totalPrice = txnsToAnalyze.reduce((sum, t) => sum + t.price, 0);
    const averagePrice = Math.round(totalPrice / txnsToAnalyze.length);
    const totalArea = txnsToAnalyze.reduce((sum, t) => sum + t.area, 0);
    const avgArea = totalArea / txnsToAnalyze.length;
    const unitPrice = totalArea > 0 ? Math.round(averagePrice / avgArea) : 0;

    // Determine market trend
    const oldestTxn = txnsToAnalyze[txnsToAnalyze.length - 1]?.price || averagePrice;
    const newestTxn = txnsToAnalyze[0]?.price || averagePrice;
    const trendChange = oldestTxn > 0 ? ((newestTxn - oldestTxn) / oldestTxn) * 100 : 0;

    let trend = 'stable';
    if (trendChange > 5) {
      trend = 'rising';
    } else if (trendChange < -5) {
      trend = 'falling';
    }

    return {
      address,
      propertyType: sortedTxns[0]?.propertyType || 'apartment',
      recentTransactions: txnsToAnalyze.slice(0, 10),
      averagePrice,
      unitPrice,
      marketTrend: trend,
      transactionFrequency: txnsToAnalyze.length,
      estimatedValue: averagePrice,
    };
  }

  // ============ MOCK DATA FOR DEVELOPMENT ============

  private getMockTransactions(givenArea: string): RealEstateTransaction[] {
    return [
      {
        transactionDate: '20260110',
        price: 850000000,
        address: '서울시 강남구 역삼동',
        addressDetail: '분당 아파트',
        propertyType: 'apartment',
        area: 114,
        floor: 25,
        unit: '2501',
      },
      {
        transactionDate: '20251215',
        price: 820000000,
        address: '서울시 강남구 역삼동',
        addressDetail: '분당 아파트',
        propertyType: 'apartment',
        area: 114,
        floor: 18,
        unit: '1801',
      },
      {
        transactionDate: '20251120',
        price: 880000000,
        address: '서울시 강남구 역삼동',
        addressDetail: '분당 아파트',
        propertyType: 'apartment',
        area: 114,
        floor: 35,
        unit: '3503',
      },
    ];
  }

  private getMockAppartmentSales(): any[] {
    return [
      {
        transactionDate: '202601',
        price: 850000000,
        address: '서울시 강남구 역삼동',
        buildingName: '분당 아파트',
        area: 114,
        floor: 25,
      },
    ];
  }

  private getMockLandTransactions(): LandInfo[] {
    return [
      {
        landAddress: '서울시 강남구 테헤란로',
        landArea: 500,
        totalPrice: 2500000000,
        unitPrice: 5000000,
        exchangeableYn: 'Y',
        contractingCounty: '강남구',
      },
    ];
  }

  private getMockApartmentInfo(apartmentName: string): ApartmentInfo[] {
    return [
      {
        complexName: apartmentName || '분당 아파트',
        address: '서울시 강남구 역삼동 456',
        buildYear: 2005,
        totalHouseholds: 1200,
        totalArea: 150000,
        area: 114,
        addressCode: '11680',
        latitude: 37.4979,
        longitude: 127.039,
      },
    ];
  }
}
