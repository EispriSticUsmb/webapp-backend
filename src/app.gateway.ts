// src/app.gateway.ts

import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket/socket.service';

@WebSocketGateway(Number(process.env.WEBSOCKET_PORT ?? 3001))
export class AppGateway implements OnGatewayInit {
  @WebSocketServer()
  private readonly server: Server;

  constructor(private socketService: SocketService) {}

  afterInit() {
    this.socketService.server = this.server;
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() roomName: string,
    @ConnectedSocket() client: Socket,
  ) {
    void client.join(roomName);
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @MessageBody() roomName: string,
    @ConnectedSocket() client: Socket,
  ) {
    void client.leave(roomName);
  }
}
