# DynamoDB Database Schema

## Table Design Overview

### Single Table Design Pattern
Using DynamoDB best practices with a single table design for optimal performance and cost efficiency.

```
Table Name: boardgame-timer-data
Partition Key: PK (String)
Sort Key: SK (String)
Billing Mode: PAY_PER_REQUEST
```

## Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    TEMPLATE     │     │      GAME       │     │   GAME_PLAYER   │
│                 │     │                 │     │                 │
│ PK: TEMPLATE#id │────▶│ PK: GAME#id     │────▶│ PK: GAME#id     │
│ SK: METADATA    │     │ SK: METADATA    │     │ SK: PLAYER#name │
│                 │     │                 │     │                 │
│ - name          │     │ - template_id   │     │ - player_name   │
│ - turn_time     │     │ - mode          │     │ - color         │
│ - round_time    │     │ - total_duration│     │ - total_time    │
│ - max_players   │     │ - started_at    │     │ - turns_taken   │
│ - created_at    │     │ - ended_at      │     │ - avg_turn_time │
│ - created_by    │     │ - player_count  │     │ - was_overtime  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Detailed Schema Definitions

### Templates Entity
```json
{
  "PK": "TEMPLATE#chess-standard",
  "SK": "METADATA",
  "EntityType": "TEMPLATE",
  "template_id": "chess-standard",
  "name": "Chess Standard",
  "description": "Standard chess tournament timing",
  "turn_time_seconds": 30,
  "round_time_seconds": 1800,
  "max_players": 2,
  "min_players": 2,
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "created_by": "admin",
  "usage_count": 0,
  "tags": ["chess", "tournament", "standard"]
}
```

### Games Entity
```json
{
  "PK": "GAME#game-123456",
  "SK": "METADATA",
  "EntityType": "GAME",
  "game_id": "game-123456",
  "template_id": "chess-standard",
  "template_name": "Chess Standard",
  "mode": 1,
  "total_duration_seconds": 2490,
  "player_count": 4,
  "started_at": "2024-01-01T10:00:00Z",
  "ended_at": "2024-01-01T10:41:30Z",
  "status": "COMPLETED",
  "winner": "Alice",
  "notes": "Great game!",
  "device_info": {
    "user_agent": "Mobile Safari",
    "screen_size": "375x812",
    "platform": "iOS"
  }
}
```

### Game Players Entity
```json
{
  "PK": "GAME#game-123456",
  "SK": "PLAYER#Alice",
  "EntityType": "GAME_PLAYER",
  "game_id": "game-123456",
  "player_name": "Alice",
  "player_color": "#FF5733",
  "player_order": 1,
  "total_time_seconds": 1245,
  "turns_taken": 23,
  "average_turn_time": 54.13,
  "longest_turn_seconds": 120,
  "shortest_turn_seconds": 15,
  "was_overtime": false,
  "overtime_seconds": 0,
  "final_turn_time": 45,
  "final_round_time": 300
}
```

## Global Secondary Indexes (GSI)

### GSI-1: Player History Index
```
GSI Name: PlayerHistoryIndex
Partition Key: player_name (String)
Sort Key: ended_at (String)
Projection: ALL

Purpose: Query all games for a specific player
Query Pattern: Get game history for player "Alice"
```

### GSI-2: Template Usage Index
```
GSI Name: TemplateUsageIndex  
Partition Key: template_id (String)
Sort Key: ended_at (String)
Projection: ALL

Purpose: Query all games using a specific template
Query Pattern: Get usage statistics for "chess-standard" template
```

### GSI-3: Date Range Index
```
GSI Name: DateRangeIndex
Partition Key: EntityType (String)
Sort Key: ended_at (String)
Projection: ALL

Purpose: Query games within date ranges
Query Pattern: Get all games from last week
```

## Access Patterns and Queries

### 1. Template Operations
```sql
-- Get all templates
Query: PK = "TEMPLATE" AND begins_with(SK, "TEMPLATE#")

-- Get specific template
GetItem: PK = "TEMPLATE#chess-standard", SK = "METADATA"

-- Create template
PutItem: New template record

-- Update template
UpdateItem: Modify existing template attributes
```

### 2. Game Operations
```sql
-- Create new game
PutItem: Game metadata + multiple player records

-- Get game details
Query: PK = "GAME#game-123456"

-- Get player history
Query GSI-1: player_name = "Alice"

-- Get template usage
Query GSI-2: template_id = "chess-standard"
```

### 3. Analytics Queries
```sql
-- Games by date range
Query GSI-3: EntityType = "GAME" AND ended_at BETWEEN "2024-01-01" AND "2024-01-31"

-- Player performance
Query GSI-1: player_name = "Alice" ORDER BY ended_at DESC LIMIT 10

-- Popular templates
Scan: EntityType = "TEMPLATE" with usage_count aggregation
```

## Data Validation Rules

### Template Validation
```python
template_schema = {
    "name": {"type": "string", "minlength": 1, "maxlength": 100},
    "turn_time_seconds": {"type": "integer", "min": 5, "max": 3600},
    "round_time_seconds": {"type": "integer", "min": 60, "max": 86400},
    "max_players": {"type": "integer", "min": 2, "max": 8},
    "min_players": {"type": "integer", "min": 2, "max": 8}
}
```

### Game Validation
```python
game_schema = {
    "mode": {"type": "integer", "allowed": [1, 2]},
    "player_count": {"type": "integer", "min": 2, "max": 8},
    "total_duration_seconds": {"type": "integer", "min": 1},
    "players": {
        "type": "list",
        "minlength": 2,
        "maxlength": 8,
        "schema": {
            "type": "dict",
            "schema": {
                "name": {"type": "string", "minlength": 1, "maxlength": 50},
                "color": {"type": "string", "regex": "^#[0-9A-Fa-f]{6}$"},
                "total_time_seconds": {"type": "number", "min": 0}
            }
        }
    }
}
```

## Sample Data Population

### Default Templates
```json
[
  {
    "PK": "TEMPLATE#chess-blitz",
    "SK": "METADATA",
    "name": "Chess Blitz",
    "turn_time_seconds": 15,
    "round_time_seconds": 300,
    "max_players": 2
  },
  {
    "PK": "TEMPLATE#monopoly-standard", 
    "SK": "METADATA",
    "name": "Monopoly Standard",
    "turn_time_seconds": 120,
    "round_time_seconds": 7200,
    "max_players": 6
  },
  {
    "PK": "TEMPLATE#scrabble-tournament",
    "SK": "METADATA", 
    "name": "Scrabble Tournament",
    "turn_time_seconds": 90,
    "round_time_seconds": 3600,
    "max_players": 4
  }
]
```

## Performance Considerations

### Read Patterns
- **Hot Partitions**: Distribute templates across multiple partitions
- **Consistent Reads**: Use eventually consistent reads for better performance
- **Batch Operations**: Use BatchGetItem for multiple template retrieval

### Write Patterns
- **Burst Capacity**: Design for occasional traffic spikes
- **Write Sharding**: Use random suffixes for high-write scenarios
- **Conditional Writes**: Prevent duplicate game IDs

### Cost Optimization
- **TTL**: Set TTL on old game records (optional)
- **Projection**: Use sparse indexes to reduce storage costs
- **Compression**: Store large JSON objects compressed

## Backup and Recovery

### Point-in-Time Recovery
```yaml
BackupPolicy:
  PointInTimeRecoveryEnabled: true
  BackupRetentionPeriod: 35 days
  
ContinuousBackups:
  Enabled: true
  PointInTimeRecoveryEnabled: true
```

### Export Strategy
```python
# Weekly export to S3 for analytics
export_config = {
    "S3Bucket": "boardgame-timer-exports",
    "S3Prefix": "weekly-exports/",
    "ExportFormat": "DYNAMODB_JSON",
    "ExportTime": "2024-01-01T00:00:00Z"
}
```