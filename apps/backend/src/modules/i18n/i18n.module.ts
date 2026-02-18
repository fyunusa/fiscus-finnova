import { Module } from '@nestjs/common';
import { I18nModule as BaseI18nModule } from 'nestjs-i18n';
import * as path from 'path';
import { I18nService } from './i18n.service';

const isDevelopment = process.env.NODE_ENV !== 'production';
const localesPath = path.join(__dirname, './locales/');

@Module({
  imports: [
    BaseI18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: localesPath,
        watch: isDevelopment,
      },
    }),
  ],
  providers: [I18nService],
  exports: [I18nService],
})
export class I18nConfigModule {}
