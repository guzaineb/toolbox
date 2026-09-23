import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>();

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ?? client.handshake.query?.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token as string);
      const userId = payload.sub as string;
      if (!userId) {
        client.disconnect();
        return;
      }

      const room = `user:${userId}`;
      client.join(room);

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      client.data.userId = userId;
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(client.id);
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  sendToUser(userId: string, event: string, data: unknown) {
    if (!this.server) return;
    this.server.to(`user:${userId}`).emit(event, data);
  }

  sendNotification(userId: string, notification: unknown) {
    this.sendToUser(userId, 'notification:new', notification);
  }

  sendUnreadUpdate(userId: string, count: number) {
    this.sendToUser(userId, 'unread:update', { count });
  }

  isUserConnected(userId: string): boolean {
    return (
      this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0
    );
  }
}
