import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

export interface CreditInfo {
  score: number;
  rating: string;
  status: 'good' | 'fair' | 'poor';
}

@Injectable()
export class CreditInfoService {
  private readonly kcbApiUrl = process.env.KCB_API_URL || 'https://koreacb.biz/api';

  async getCreditScore(residentNumber: string): Promise<CreditInfo> {
    try {
      const response = await axios.post(`${this.kcbApiUrl}/v1/credit/score`, {
        resident_number: residentNumber,
      });

      const score = response.data.score || 0;
      return {
        score,
        rating: this.getRating(score),
        status: this.getStatus(score),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Credit score lookup failed: ${errorMessage}`);
    }
  }

  async getCreditReport(residentNumber: string): Promise<any> {
    try {
      const response = await axios.get(`${this.kcbApiUrl}/v1/credit/report`, {
        params: { resident_number: residentNumber },
      });

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Credit report lookup failed: ${errorMessage}`);
    }
  }

  private getRating(score: number): string {
    if (score >= 800) return 'Excellent';
    if (score >= 700) return 'Good';
    if (score >= 600) return 'Fair';
    return 'Poor';
  }

  private getStatus(score: number): 'good' | 'fair' | 'poor' {
    if (score >= 700) return 'good';
    if (score >= 600) return 'fair';
    return 'poor';
  }
}
