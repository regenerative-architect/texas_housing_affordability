# Texas Housing Affordability & Resilience Collaboration OS v2.0

Public-ready, local-first housing operating system for Texas. This edition extends the original Housing OS with decentralized peer collaboration, multidisciplinary work records, progressive advanced guides, current dated statewide evidence, optional in-browser WebLLM, and PWA/offline support.

## Start

### Standalone
Open `index.html` directly. Core calculators, reference material, IndexedDB records, JSON import/export, advanced guides, deterministic planning and same-device BroadcastChannel collaboration work without a server where browser security policies permit them.

Remote module loading, service workers, installability and remote WebRTC discovery are more reliable when the bundle is served over HTTPS or localhost.

### Hosted / PWA
From this folder:

```bash
python -m http.server 8080
```

Open `http://localhost:8080/`. Service workers do not run from `file://`.

## Multiplayer architecture

- **Trystero 0.25.3** pinned at runtime.
- **Nostr** discovery by default.
- Selectable **MQTT**, **BitTorrent** and **IPFS** discovery strategies.
- Direct **WebRTC data channels** carry collaboration records after peers connect.
- Modern action-object API: `room.makeAction()`, `.send()`, `.onMessage`, plus request/response snapshot sync.
- When a peer joins, it can request a current shared-room snapshot from an existing peer.
- Same-device **BroadcastChannel** fallback works without Trystero or internet access.
- Shared-room records are separate from core household/private records.
- Synchronization uses revision + base-revision metadata. Concurrent/branched records are surfaced as explicit conflicts.
- Peer identifiers and presence labels are **not verified identities**.
- Optional room password uses Trystero's stronger session-description encryption path.
- **TURN is not hidden infrastructure.** The UI exposes TURN only as an explicit fallback for networks where direct WebRTC cannot connect.

The default public room is `texas-housing-commons-public-v1`. On initial load the app joins it with an anonymous/self-asserted presence label when the browser is online. No private household records are automatically transmitted.

## Shared collaboration record types

- project
- task
- decision
- comment

Each record can carry a workstream, stakeholder/disciplinary owner role, status, due date, evidence grade, revision metadata and narrative detail.

Supported cross-domain workstreams include housing, land, zoning, permitting, water, energy, mobility, broadband, resilience, health, education, workforce, finance, insurance, accessibility, homelessness prevention and evidence.

## WebLLM

- `webllm-worker.mjs` uses WebLLM **0.2.85**.
- Main-thread UI creates a dedicated `WebWorkerMLCEngine` when the user initializes a model.
- Default selectable model is Llama 3.2 1B q4f16; q4f32 is also offered.
- Model loading requires WebGPU and an initial model download unless cached.
- If WebGPU/model initialization/generation fails, the app uses a deterministic local planning engine instead of presenting a fake AI result.
- WebLLM model artifacts are left to WebLLM's own cache rather than duplicated in the service-worker cache.

## Simplified Advanced Guides

Each guide has four layers:

1. One-minute explanation
2. Actionable steps
3. Advanced explanation
4. Expert / implementation detail

Included topics:

- connectivity diagnosis and WebRTC/TURN;
- Trystero 0.25.3 and discovery strategies;
- Texas broadband-project status;
- housing/geospatial mapping challenges;
- multidisciplinary housing project design;
- WebLLM worker architecture;
- PWA/offline architecture;
- evidence/provenance;
- data sovereignty and conflict-aware synchronization;
- housing ↔ water ↔ energy ↔ mobility ↔ resilience integration.

## Dated evidence included

`data/current-evidence.json` records the values used in the interface and their source periods. Retrieval date: **2026-09-28**.

Examples from U.S. Census Bureau QuickFacts for Texas:

- July 1, 2025 population estimate: **31,709,821**
- July 1, 2025 housing units estimate: **12,848,245**
- 2020–2024 median gross rent: **$1,403/month**
- 2020–2024 median owner-occupied housing value: **$283,800**
- 2020–2024 median selected monthly owner cost with mortgage: **$2,106**
- 2020–2024 median household income: **$78,476** (2024 dollars)
- 2020–2024 household broadband subscription: **91.4%**
- 2024 building permits: **225,756**

Source years differ. The application deliberately does not relabel these as all being 2026 values.

Texas Broadband Development Office status embedded in the guides/evidence layer includes the approved BEAD Final Proposal and BOOT program award totals. Project-specific deployment/activation must be verified against official current award files and maps.

## Privacy and data sovereignty

Private/core records stay in IndexedDB by default. The application does not automatically synchronize:

- income;
- rent/mortgage;
- home address;
- housing-instability status;
- household composition;
- household digital-twin details.

Only records explicitly created/imported in the Multiplayer Commons are eligible for synchronization. Remote deletion is not guaranteed after a peer has received data.

Backups use validated JSON and now include the collaboration stores (`shared`, `conflicts`). Import limit is 5 MB.

## Offline behavior

Precached by the versioned service worker:

- app shell;
- `index.html`;
- `enhancements.js`;
- `webllm-worker.mjs`;
- manifest;
- evidence JSON;
- README;
- PWA icons.

Remote P2P discovery and live sources do not work offline. Same-device BroadcastChannel can continue. WebLLM can run offline only when required code/model artifacts are already cached by the browser/WebLLM.

## Optional legacy/self-hosted relay

`legacy-server/` contains an **optional** Trystero WebSocket relay adapter using `@trystero-p2p/ws-relay` 0.25.3. It is not used by the default app. See its README before deployment.

TURN is a separate service from discovery/signaling and is not bundled or silently provided.

## Security notes

- No embedded API keys or TURN credentials.
- Room password and TURN credentials are session-only.
- Defensive HTML escaping for user-visible collaboration data.
- Import file-size/schema checks.
- No hidden analytics or telemetry.
- Public-room identity is self-asserted.
- SHA-256 can show file integrity/consistency; it does not independently prove authorship.

## Testing performed

- JavaScript syntax checks for the enhancement and worker modules.
- Core inline-script syntax extraction/check.
- HTML parse / referenced local-file checks.
- Service-worker/manifest JSON/file-list checks.
- ZIP integrity test.

Live peer discovery and WebGPU model execution depend on browser/network/hardware conditions and are therefore not represented as universally tested across all environments.

## Attributions

Systems architecture/concept: **Ricky Foster + Navi / Planetary Restoration Archive**.

See `ATTRIBUTIONS_AND_LICENSES.md` for runtime library licenses and authoritative data sources.

## Zero-Harm / Anti-Inversion

Use the system to improve affordability, stability, safety, accessibility, resilience, evidence quality and informed coordination. Do not use it to discriminate, exploit tenants, facilitate unlawful eviction, enable predatory lending, expose private household information, impersonate institutions, or convert peer presence into unsupported identity claims.
