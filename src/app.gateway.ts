// src/app.gateway.ts

import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SocketService } from './socket/socket.service';

@WebSocketGateway(Number(process.env.WEBSOCKET_PORT ?? 3001))
export class AppGateway implements OnGatewayInit {
  @WebSocketServer()
  private readonly server: Server;

  constructor(private socketService: SocketService) {}

  afterInit() {
    this.socketService.server = this.server;
  }
}
