let ws;
let heartbeatInterval;

const initializeWebSocket = (userId) => {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return; // Ya conectado o en proceso de conexión
  }

  ws = new WebSocket('wss://apis-websocket-server-rl7jojcn3q-uc.a.run.app/', userId);

  ws.onopen = () => {
    ws.isAlive = true;
    ws.send('pong'); // Enviar un pong al establecer la conexión
    heartbeatInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('ping'); // Enviar un ping regularmente
      }
    }, 15000); // Enviar un ping cada 15 segundos
  };

  ws.onmessage = (event) => {
    if (event.data === 'pong') {
      ws.isAlive = true;
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    clearInterval(heartbeatInterval);
    setTimeout(() => initializeWebSocket(userId), 1000); // Reintentar conexión después de 1 segundo
  };
};

const closeWebSocket = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close();
    clearInterval(heartbeatInterval);
  }
};

export { initializeWebSocket, closeWebSocket };
