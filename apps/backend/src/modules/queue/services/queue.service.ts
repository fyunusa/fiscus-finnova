import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';

export interface MessageHandler {
  (data: any): Promise<void>;
}

@Injectable()
export class QueueService {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  async connect(): Promise<void> {
    try {
      this.connection = (await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost')) as any;
      this.channel = await (this.connection as any).createChannel();
      console.log('RabbitMQ Connected');
    } catch (error: any) {
      console.error('RabbitMQ Connection Error:', error?.message || error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.channel) await this.channel.close();
    if (this.connection) await (this.connection as any).close();
  }

  async declareQueue(queue: string): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');
    await this.channel.assertQueue(queue, { durable: true });
  }

  async publishMessage(queue: string, data: any): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');
    await this.declareQueue(queue);
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), {
      persistent: true,
    });
  }

  async consumeMessage(queue: string, handler: MessageHandler): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');
    await this.declareQueue(queue);
    this.channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          await handler(data);
          this.channel!.ack(msg);
        } catch (error: any) {
          console.error('Message processing error:', error?.message || error);
          this.channel!.nack(msg, false, true); // Requeue on error
        }
      }
    });
  }

  async declareTopic(exchange: string, topic: string): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');
    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    const queue = await this.channel.assertQueue('', { exclusive: true });
    await this.channel.bindQueue(queue.queue, exchange, topic);
  }

  async publishToTopic(exchange: string, topic: string, data: any): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');
    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    this.channel.publish(exchange, topic, Buffer.from(JSON.stringify(data)), {
      persistent: true,
    });
  }

  async consumeFromTopic(
    exchange: string,
    topic: string,
    handler: MessageHandler,
  ): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');
    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    const queue = await this.channel.assertQueue('', { exclusive: true });
    await this.channel.bindQueue(queue.queue, exchange, topic);

    this.channel.consume(queue.queue, async (msg) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          await handler(data);
          this.channel!.ack(msg);
        } catch (error: any) {
          console.error('Topic message processing error:', error?.message || error);
          this.channel!.nack(msg, false, true);
        }
      }
    });
  }
}
