import { Module } from '@nestjs/common';
import { KakaoMapsService } from './services/kakao-maps.service';
import { PublicDataService } from './services/public-data.service';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { IdentityVerificationService } from './services/identity-verification.service';
import { CreditInfoService } from './services/credit-info.service';
import { RealEstatePriceService } from './services/real-estate-price.service';
import { MediaUploadService } from './services/media-upload.service';

@Module({
  providers: [
    KakaoMapsService,
    PublicDataService,
    PaymentGatewayService,
    IdentityVerificationService,
    CreditInfoService,
    RealEstatePriceService,
    MediaUploadService,
  ],
  exports: [
    KakaoMapsService,
    PublicDataService,
    PaymentGatewayService,
    IdentityVerificationService,
    CreditInfoService,
    RealEstatePriceService,
    MediaUploadService,
  ],
})
export class ExternalApiModule {}
