import { WebSocket } from 'ws';

export interface WSClient {
  id: string;
  userId?: string;
  username?: string;
  ws: WebSocket;
}

export enum WsMessageType {
  Welcome = 'welcome',
  ProductCommentByGuest = 'product_comment_by_guest',
  ProductCommnetAndRating = 'product_comment_and_rating',
  JoinProduct = 'join_product',
  LeaveProduct = 'leave_product',
  ProductViewers = 'product_viewers',
  Ping = 'ping',
  Auth = 'auth',
}
export interface JoinProductPayload {
  productId: string;
}

export interface LeaveProductPayload {
  productId: string;
}
