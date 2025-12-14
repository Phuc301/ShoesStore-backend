import { WebSocketServer, WebSocket as WsWebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import {
  WSClient,
  WsMessageType,
  JoinProductPayload,
  LeaveProductPayload,
} from './types.ws';
import { generateId, setupKeepAlive } from './utils.ws';
import { clientManager } from './clientManager.ws';
import reviewService from '../services/review.service';
import { IReview } from '../interfaces/review.interface';

export class WSServer {
  private wss: WebSocketServer;
  private userId?: number | undefined;
  constructor(server: any) {
    this.wss = new WebSocketServer({ server, path: '/api/ws' });
    this.wss.on('connection', this.handleConnection.bind(this));

    setupKeepAlive(clientManager['clients']);
  }
  private handleConnection(ws: WsWebSocket, req: any) {
    const query = req.url?.split('?')[1] || '';
    const params = new URLSearchParams(query);
    // Join but no product
    const productId = params.get('productId');
    const clientId = generateId();
    const client: WSClient = { id: clientId, ws };
    clientManager.addClient(clientId, client);

    // Join Product
    if (productId) {
      clientManager.joinProduct(clientId, productId);
    }
    // Send client Id
    ws.send(
      JSON.stringify({
        type: WsMessageType.Welcome,
        payload: {
          clientId,
          productId,
          message: 'Connected successfully!',
        },
      })
    );

    ws.on('message', async (data: string) => {
      try {
        await this.handleMessage(clientId, data);
      } catch (err) {}
    });

    // Close connection on disconnect
    ws.on('close', () => clientManager.removeClient(clientId));
    ws.on('error', (err) =>
      console.error(`WebSocket error from ${clientId}:`, err)
    );
  }
  private async handleMessage(clientId: string, data: string) {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch {
      console.warn('Invalid JSON:', data);
      return;
    }
    switch (msg.type) {
      case WsMessageType.ProductCommentByGuest:
        await this.handleCommentByGuest(msg.payload);
        break;
      case WsMessageType.ProductCommnetAndRating:
        await this.handleCommentAndRating(
          msg.payload,
          msg.payload.userName,
          msg.payload.avatar
        );
        break;
      case WsMessageType.JoinProduct:
        this.handleJoinProduct(clientId, msg.payload);
        break;
      case WsMessageType.LeaveProduct:
        this.handleLeaveProduct(clientId, msg.payload);
        break;
      case WsMessageType.Auth:
        try {
          const token = msg.payload.token;
          const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
          if (user) {
            this.userId = (user as any).userId;
          }
        } catch (err) {
          console.log(err);
        }
        break;
      default:
        console.warn('Unknown message type:', msg.type);
    }
  }
  private async handleCommentByGuest(payload: Partial<IReview>) {
    const data = await reviewService.createReview({
      ...payload,
      rating: undefined,
      isGuest: true,
    });
    const viewers = clientManager.getViewers(
      payload.productId?.toString() || ''
    );
    for (const client of viewers) {
      if (client.ws.readyState === WsWebSocket.OPEN) {
        client.ws.send(
          JSON.stringify({
            type: WsMessageType.ProductCommentByGuest,
            payload: data,
          })
        );
      }
    }
  }
  private async handleCommentAndRating(
    payload: Partial<IReview>,
    userName?: string,
    avatar?: string
  ) {
    if (!this.userId) return;
    const data = await reviewService.createReview(
      payload,
      this.userId,
      userName,
      avatar
    );
    const viewers = clientManager.getViewers(
      payload.productId?.toString() || ''
    );
    for (const client of viewers) {
      if (client.ws.readyState === WsWebSocket.OPEN) {
        client.ws.send(
          JSON.stringify({
            type: WsMessageType.ProductCommnetAndRating,
            payload: data,
          })
        );
      }
    }
  }
  private handleJoinProduct(clientId: string, payload: JoinProductPayload) {
    clientManager.joinProduct(clientId, payload.productId);

    const viewers = clientManager.getViewers(payload.productId);
    for (const client of viewers) {
      if (client.ws.readyState === WsWebSocket.OPEN) {
        client.ws.send(
          JSON.stringify({
            type: WsMessageType.ProductViewers,
            payload: {
              productId: payload.productId,
              viewers: viewers.map((v) => v.username || 'Guest'),
            },
          })
        );
      }
    }
  }
  private handleLeaveProduct(clientId: string, payload: LeaveProductPayload) {
    clientManager.leaveProduct(clientId, payload.productId);
  }
}

export default WSServer;
