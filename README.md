# BoardGame Timer

A serverless, mobile-friendly boardgame timer supporting multiple game modes and players.

## Quick Start

1. **Development Setup**:
   ```bash
   npm install
   npm run dev
   ```

2. **Open**: http://localhost:3000

## Development Plan

Follow the tasks in `plan.md` for structured development:

### Current Phase: Phase 1 - Foundation & Core Timer
- [ ] Task 1.1: Project Setup & Structure ✅
- [ ] Task 1.2: Player Setup Interface (Next)
- [ ] Task 1.3: Mode 1 Timer Implementation
- [ ] Task 1.4: Touch Interface & Turn Management
- [ ] Task 1.5: Basic Game Controls

## Project Structure

```
frontend/
├── index.html          # Main game interface
├── css/               # Stylesheets
├── js/                # JavaScript modules
└── assets/            # Images, icons

backend/
├── lambda_functions/  # AWS Lambda code
└── common/           # Shared utilities

infrastructure/       # CloudFormation templates
tests/               # Unit and integration tests
```

## Features

- **Mode 1**: Track total time per player
- **Mode 2**: Countdown timers with overtime detection
- **2-8 Players**: Color-coded player management
- **Mobile Optimized**: Touch-friendly interface
- **Serverless**: AWS Lambda + DynamoDB backend

## Next Steps

1. Start with Task 1.2: Player Setup Interface
2. Create `frontend/index.html` with basic structure
3. Implement player form with validation
4. Add color picker functionality

See `plan.md` for detailed task breakdown and acceptance criteria.