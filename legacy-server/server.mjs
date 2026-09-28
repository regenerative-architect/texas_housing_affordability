import { createWsRelayServer } from '@trystero-p2p/ws-relay/server';
const port = Number(process.env.PORT || 8081);
createWsRelayServer({port});
console.log(`Optional Trystero WebSocket relay listening on port ${port}`);
