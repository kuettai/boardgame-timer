# API Specification

## Base URL
`https://api.boardgame-timer.com/v1`

## Endpoints

### Templates

#### GET /templates
Get all available game templates
```json
Response: {
  "templates": [
    {
      "template_id": "chess-standard",
      "name": "Chess Standard",
      "average_turn_time": 30,
      "average_round_time": 1800,
      "max_players": 2,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /templates
Create new template (Admin only)
```json
Request: {
  "name": "Custom Game",
  "average_turn_time": 45,
  "average_round_time": 2400,
  "max_players": 4
}

Response: {
  "template_id": "custom-game-123",
  "message": "Template created successfully"
}
```

### Games

#### POST /games
Save completed game data
```json
Request: {
  "template_id": "chess-standard",
  "mode": 1,
  "players": [
    {
      "name": "Player 1",
      "color": "#FF5733",
      "total_time": 1245,
      "turns_taken": 23
    }
  ],
  "duration": 2490
}

Response: {
  "game_id": "game-456",
  "message": "Game saved successfully"
}
```

#### GET /games/{player_name}
Get game history for a player
```json
Response: {
  "games": [
    {
      "game_id": "game-456",
      "template_name": "Chess Standard",
      "mode": 1,
      "duration": 2490,
      "player_stats": {
        "total_time": 1245,
        "turns_taken": 23,
        "average_turn_time": 54.1
      },
      "ended_at": "2024-01-01T12:30:00Z"
    }
  ]
}
```

## Error Responses
```json
{
  "error": "ValidationError",
  "message": "Invalid player count. Must be between 2 and 8.",
  "code": 400
}
```