# AWS Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USERS (Mobile/Web)                      │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CloudFront CDN                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Static Web    │ │   API Gateway   │ │   SSL/TLS       │   │
│  │   Caching       │ │   Caching       │ │   Termination   │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────┬───────────────────┬───────────────────────┘
                      │                   │
                      ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    S3 Bucket                                   │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   index.html    │ │   CSS/JS Files  │ │   Static Assets │   │
│  │   admin.html    │ │   Images        │ │   Manifest      │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API Gateway                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   /templates    │ │   /games        │ │   CORS Config   │   │
│  │   GET/POST      │ │   GET/POST      │ │   Rate Limiting │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────┬───────────────────┬───────────────────────┘
                      │                   │
                      ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Lambda Functions                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ template_crud   │ │ game_history    │ │ Common Utils    │   │
│  │ Python 3.9      │ │ Python 3.9      │ │ DynamoDB Helper │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────┬───────────────────┬───────────────────────┘
                      │                   │
                      ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DynamoDB                                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ Templates Table │ │   Games Table   │ │   GSI Indexes   │   │
│  │ Pay-per-request │ │ Pay-per-request │ │ Auto-scaling    │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Monitoring & Logging                           │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   CloudWatch    │ │   X-Ray Tracing │ │   Cost Explorer │   │
│  │   Logs/Metrics  │ │   Performance   │ │   Billing Alerts│   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Detailed Component Architecture

### Frontend Layer
```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Components                         │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   Game Timer    │    │   Admin Panel   │                    │
│  │                 │    │                 │                    │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │                    │
│  │ │ Player Setup│ │    │ │ Template    │ │                    │
│  │ │ Mode Select │ │    │ │ Management  │ │                    │
│  │ │ Timer UI    │ │    │ │ Game History│ │                    │
│  │ │ Touch Events│ │    │ │ Statistics  │ │                    │
│  │ └─────────────┘ │    │ └─────────────┘ │                    │
│  └─────────────────┘    └─────────────────┘                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                Service Worker                           │   │
│  │  • Offline caching                                     │   │
│  │  • Background sync                                     │   │
│  │  • Push notifications (future)                        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### API Layer
```
┌─────────────────────────────────────────────────────────────────┐
│                     API Gateway                                │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Templates     │  │     Games       │  │   Health Check  │ │
│  │                 │  │                 │  │                 │ │
│  │ GET /templates  │  │ POST /games     │  │ GET /health     │ │
│  │ POST /templates │  │ GET /games/{id} │  │                 │ │
│  │ PUT /templates  │  │ GET /games?     │  │                 │ │
│  │ DELETE /template│  │   player={name} │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                Request/Response Flow                    │   │
│  │  • CORS headers                                        │   │
│  │  • Request validation                                  │   │
│  │  • Rate limiting (1000 req/min)                       │   │
│  │  • Error handling                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram
```
User Action → CloudFront → S3/API Gateway → Lambda → DynamoDB
     ↓              ↓              ↓           ↓         ↓
   Touch         Cache Hit      Validation   Business   Data
   Screen        or Miss        & CORS       Logic      Storage
     ↓              ↓              ↓           ↓         ↓
   Timer         Static          Lambda      Process    Query/
   Update        Content         Function    Request    Update
     ↓              ↓              ↓           ↓         ↓
   UI            Browser         Response    Format     Return
   Refresh       Display         to User     Data       Result
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Security Layers                             │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   CloudFront    │  │   API Gateway   │  │    Lambda       │ │
│  │                 │  │                 │  │                 │ │
│  │ • SSL/TLS       │  │ • API Keys      │  │ • IAM Roles     │ │
│  │ • WAF Rules     │  │ • Rate Limiting │  │ • VPC (optional)│ │
│  │ • DDoS Protect  │  │ • Request Size  │  │ • Env Variables │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   DynamoDB      │  │   CloudWatch    │  │   IAM Policies  │ │
│  │                 │  │                 │  │                 │ │
│  │ • Encryption    │  │ • Log Analysis  │  │ • Least Priv    │ │
│  │ • Access Control│  │ • Anomaly Det   │  │ • Resource ARNs │ │
│  │ • Backup/PITR   │  │ • Alerting      │  │ • Conditions    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```