# BoardGame Timer - Inception Plan

## 1. Core Requirements

### Game Modes
- **Mode 1**: Track total time per player per turn
- **Mode 2**: Countdown timers (per-turn + per-round) with penalties
- Support for 2-8 players (optimized for 4)
- Pause/Resume functionality
- End Game with optional data upload

### User Interface
- Full-screen mobile/tablet friendly
- Preload timer template
- Touch-anywhere to advance turns
- Color picker for player identification
- Visual indicators (sad face for overtime)

### Admin Features
- Template creation/management
- Game history storage
- Player statistics

## 2. Technical Architecture

### Frontend (Static Web App)
- **Technology**: Vanilla JavaScript, CSS3, HTML5
- **Responsive**: Mobile-first design
- **Offline**: Service Worker for basic functionality
- **State Management**: LocalStorage + SessionStorage

### Backend (Serverless)
- **Runtime**: Python 3.9
- **Functions**:
  - `create_template` - POST /templates
  - `get_templates` - GET /templates
  - `save_game` - POST /games
  - `get_game_history` - GET /games/{player_id}

### Database Schema (DynamoDB)

#### Templates Table
```
PK: template_id (String)
SK: "TEMPLATE"
name: String
average_turn_time: Number (seconds)
average_round_time: Number (seconds)
max_players: Number
created_at: String (ISO)
```

#### Games Table
```
PK: game_id (String)
SK: "GAME"
template_id: String
players: List[Object]
  - name: String
  - color: String
  - total_time: Number
  - turns_taken: Number
mode: Number (1 or 2)
duration: Number (seconds)
ended_at: String (ISO)
```

## 3. Implementation Phases

### Phase 1: Core Timer (Week 1)
- [x] Basic HTML structure with full-screen layout
- [x] Player setup form (names, colors, mode selection)
- [x] Mode 1 timer implementation
- [x] Touch detection for turn advancement
- [x] Pause/Resume functionality

### Phase 2: Advanced Features (Week 2)
- [x] Mode 2 implementation (dual timers)
- [x] Visual indicators (sad face, color transitions)
- [x] End game functionality
- [ ] Local data persistence

### Phase 3: Backend Integration (Week 3)
- [ ] DynamoDB table creation
- [ ] Lambda functions for templates
- [ ] API Gateway setup
- [ ] Frontend-backend integration

### Phase 4: Admin Panel (Week 4)
- [ ] Admin interface for templates
- [ ] Game history viewing
- [ ] Data export functionality
- [ ] Performance optimization

### Phase 5: Deployment & Polish (Week 5)
- [ ] S3 + CloudFront setup
- [ ] SSL certificate
- [ ] Performance testing
- [ ] Mobile optimization
- [ ] Documentation

## 4. Key Technical Decisions

### Timer Implementation
- Use `performance.now()` for high precision
- Web Workers for background timing
- Visibility API to handle tab switching

### State Management
```javascript
gameState = {
  mode: 1 | 2,
  players: [
    {
      id: string,
      name: string,
      color: string,
      totalTime: number,
      turnTime: number,    // Mode 2 only
      roundTime: number,   // Mode 2 only
      isOvertime: boolean
    }
  ],
  currentPlayer: number,
  isPaused: boolean,
  startTime: timestamp,
  template: object
}
```

### Mobile Optimization
- Prevent screen sleep with NoSleep.js
- Touch events for turn advancement
- Responsive breakpoints: 320px, 768px, 1024px
- PWA capabilities for app-like experience

## 5. Cost Estimation (Monthly)

### AWS Services
- **S3**: ~$1 (static hosting)
- **CloudFront**: ~$1 (CDN)
- **DynamoDB**: ~$2.50 (25GB, 100 RCU/WCU)
- **Lambda**: ~$0.20 (1M requests)
- **API Gateway**: ~$3.50 (1M requests)

**Total**: ~$8/month for moderate usage

## 6. Security Considerations
- CORS configuration for API access
- Input validation on all Lambda functions
- Rate limiting on API Gateway
- Optional: Cognito for admin authentication

## 7. Performance Targets
- Initial load: <2 seconds
- Timer precision: ±50ms
- Touch response: <100ms
- Offline functionality: Basic timer operations