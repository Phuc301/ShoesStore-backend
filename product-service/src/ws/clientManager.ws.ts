import { WSClient } from './types.ws';

class ClientManager {
  private clients: Map<string, WSClient> = new Map();
  private productViewers: Map<string, Set<string>> = new Map();
  // Add client to map
  addClient(clientId: string, client: WSClient) {
    this.clients.set(clientId, client);
  }
  // Remove client from map
  removeClient(clientId: string) {
    this.clients.delete(clientId);
    for (const viewers of this.productViewers.values()) {
      viewers.delete(clientId);
    }
  }
  // Join Product
  joinProduct(clientId: string, productId: string) {
    if (!this.productViewers.has(productId)) {
      this.productViewers.set(productId, new Set());
    }
    this.productViewers.get(productId)!.add(clientId);
  }
  // Levave product
  leaveProduct(clientId: string, productId: string) {
    this.productViewers.get(productId)?.delete(clientId);
  }
  // Get all viewers
  getViewers(productId: string) {
    const viewers = this.productViewers.get(productId);
    if (!viewers) return [];
    return Array.from(viewers)
      .map((id) => this.clients.get(id))
      .filter(Boolean) as WSClient[];
  }
  // Get all clients
  getAllClients(): WSClient[] {
    return Array.from(this.clients.values());
  }
}

export const clientManager = new ClientManager();
