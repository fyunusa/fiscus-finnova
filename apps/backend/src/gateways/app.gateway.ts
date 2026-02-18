import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: [
      'https://admin-fiscus.netlify.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://fiscus-finnova.netlify.app',
    ],
    credentials: true,
  },
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  afterInit(server: Server) {
    console.log('WebSocket initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, data: any): void {
    console.log(`Message from ${client.id}:`, data);
    client.emit('response', { status: 'received', data });
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket, data: any): void {
    client.emit('pong', { timestamp: new Date() });
  }

  // Broadcast message to all clients
  broadcastMessage(message: any): void {
    this.server.emit('broadcast', message);
  }

  // Send message to specific user
  sendToUser(userId: string, message: any): void {
    this.server.to(userId).emit('message', message);
  }

  // Send notification
  sendNotification(userId: string, notification: any): void {
    this.server.to(userId).emit('notification', {
      ...notification,
      timestamp: new Date(),
    });
  }

  // Send transaction update
  sendTransactionUpdate(userId: string, transaction: any): void {
    this.server.to(userId).emit('transaction-update', transaction);
  }

  // Join user to room
  joinRoom(client: Socket, room: string): void {
    client.join(room);
  }

  // Leave room
  leaveRoom(client: Socket, room: string): void {
    client.leave(room);
  }

  // Send to room
  sendToRoom(room: string, message: any): void {
    this.server.to(room).emit('message', message);
  }
}
