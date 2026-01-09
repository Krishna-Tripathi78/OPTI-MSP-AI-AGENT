# Frontend Services

API clients that connect to the FastAPI backend.

## Services Overview

| File | Purpose | Backend Endpoints |
|------|---------|-------------------|
| `api.ts` | Base API client with auth | All endpoints |
| `userService.ts` | Authentication | `/api/auth/*` |
| `mspDataService.ts` | Dashboard & clients | `/api/dashboard`, `/api/clients` |
| `teamDataService.ts` | Team management | `/api/team/*` |
| `anomalyService.ts` | Anomaly detection | `/api/anomalies/*` |
| `aiService.ts` | AI chat | `/api/chat` |

## Usage

All services automatically:
- Call backend API when available
- Fall back to mock data if backend is offline
- Handle JWT authentication

```typescript
import { api } from './api';
import { mspDataService } from './mspDataService';

// Direct API call
const clients = await api.getClients();

// Service call (with fallback)
const metrics = await mspDataService.getMSPMetrics();
```
