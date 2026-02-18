import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { config } from '@config/index';
import logger from '@common/logger/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with allowed origins
  app.enableCors({
    origin: [
      'https://admin-fiscus.netlify.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://fiscus-finnova.netlify.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Set API prefix
  app.setGlobalPrefix(config.app.apiPrefix);

  // Setup Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Fiscus Finance API')
    .setDescription('Fiscus financial backend API documentation')
    .setVersion('0.1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Enable WebSocket if feature flag is enabled
  if (process.env.FEATURE_WEBSOCKET_ENABLED !== 'false') {
    // WebSocket is configured via @WebSocketGateway decorator
    logger.log('WebSocket enabled');
  }

  // Start listening
  await app.listen(config.app.port, '0.0.0.0');
  logger.log(`Server running on http://0.0.0.0:${config.app.port}`);
  logger.log(`API Docs: http://localhost:${config.app.port}/docs`);
  logger.log(`WebSocket endpoint: ws://localhost:${config.app.port}`);
}

bootstrap().catch((err) => {
  logger.error(err, 'Failed to start server');
  process.exit(1);
});

