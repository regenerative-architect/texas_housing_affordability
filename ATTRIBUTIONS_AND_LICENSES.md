# Attributions & Licenses

## Project architecture

**Ricky Foster + Navi / Planetary Restoration Archive** — Texas Housing Affordability & Resilience Operating System systems architecture/concept and this collaboration-oriented integration layer.

## Open-source runtime libraries

### Trystero 0.25.3
- Project: https://github.com/dmotz/trystero
- License: MIT
- Used for decentralized peer discovery and WebRTC room/action abstractions.
- Runtime strategies used: Nostr, MQTT, BitTorrent and IPFS.
- Optional legacy adapter: `@trystero-p2p/ws-relay` 0.25.3.

### WebLLM 0.2.85
- Project: https://github.com/mlc-ai/web-llm
- Documentation: https://webllm.mlc.ai/
- License: Apache-2.0
- Used for optional browser-local LLM inference through a dedicated Web Worker.

No third-party source code is copied into this bundle beyond normal runtime imports and package declarations. The integration code in this bundle is original application glue built against documented public APIs.

## Authoritative public evidence sources

- U.S. Census Bureau QuickFacts / ACS — public federal statistical data.
- U.S. Department of Housing and Urban Development (HUD).
- Texas Department of Housing and Community Affairs (TDHCA).
- Texas Comptroller of Public Accounts / Broadband Development Office.
- Texas Department of Insurance.
- Texas Water Development Board.
- FEMA.
- Texas State Law Library.

Follow each publisher's current terms, data-use guidance and citation requirements when redistributing derived data.

## Integrity note

A cryptographic hash can demonstrate consistency of a particular file's bytes. It does not independently establish authorship, originality, publication priority, or legal ownership.
