import { Server } from 'socket.io';

export class SocketService {
  public server: Server;

  sendWsEvent(wsEventName: string, payload: any): void {
    this.server.to(wsEventName).emit(wsEventName, payload);
  }
}
