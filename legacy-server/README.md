# Optional / legacy WebSocket relay

The main Texas Housing OS does **not** require this server. It defaults to Trystero's decentralized discovery strategies (Nostr, with MQTT, BitTorrent and IPFS selectable) and direct WebRTC room traffic.

This directory is retained only for organizations that explicitly choose to operate a self-hosted Trystero WebSocket signaling relay.

```bash
npm install
npm start
```

Then use the Trystero `@trystero-p2p/ws-relay` client strategy in a deliberately customized deployment. Do not expose credentials in source control. This relay is for signaling/discovery; TURN is a separate WebRTC fallback service and should be configured explicitly when network conditions require it.
