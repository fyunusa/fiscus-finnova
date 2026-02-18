import { Injectable } from '@nestjs/common';
import { I18nService as BaseI18nService } from 'nestjs-i18n';

@Injectable()
export class I18nService {
  constructor(private readonly i18n: BaseI18nService) {}

  async translate(key: string, args?: Record<string, any>, lang?: string): Promise<string> {
    try {
      return await this.i18n.translate(key, {
        lang: lang || 'en',
        args,
      });
    } catch (error) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  async t(key: string, args?: Record<string, any>, lang?: string): Promise<string> {
    return this.translate(key, args, lang);
  }
}
