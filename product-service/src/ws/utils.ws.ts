import { WSClient } from './types.ws';

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export function setupKeepAlive(clients: Map<string, WSClient>) {
  setInterval(() => {
    for (const client of clients.values()) {
      if (client.ws.readyState === client.ws.OPEN) {
        // client.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }
  }, 30000);
}
