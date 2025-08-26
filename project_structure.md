# BoardGame Timer - Project Structure

```
boardgame-timer/
├── frontend/
│   ├── index.html              # Main game interface
│   ├── admin.html              # Admin panel
│   ├── css/
│   │   ├── main.css           # Game UI styles
│   │   └── admin.css          # Admin panel styles
│   ├── js/
│   │   ├── game-timer.js      # Core timer logic
│   │   ├── game-modes.js      # Mode 1 & 2 implementations
│   │   ├── player-manager.js  # Player setup & management
│   │   ├── template-manager.js # Template handling
│   │   └── api-client.js      # AWS API calls
│   └── assets/
│       └── icons/             # Timer icons, sad face, etc.
├── backend/
│   ├── lambda_functions/
│   │   ├── template_crud.py   # Template CRUD operations
│   │   ├── game_history.py    # Save/retrieve game data
│   │   └── common/
│   │       └── dynamodb_helper.py
│   ├── requirements.txt
│   └── serverless.yml        # Serverless framework config
├── infrastructure/
│   ├── cloudformation/
│   │   ├── dynamodb.yml      # DynamoDB tables
│   │   ├── api-gateway.yml   # API Gateway setup
│   │   └── s3-cloudfront.yml # Static hosting
│   └── deploy.sh
└── docs/
    ├── api-spec.md
    └── user-guide.md
```