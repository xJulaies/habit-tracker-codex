# Habit API

All habit routes require Clerk authentication. A user can only access their own habits.

## Create Habit

`POST /api/habits`

Creates a habit for the authenticated user.

For the MVP, one user can create up to 5 habits. The limit is guarded by an
atomic quota counter. Text fields are trimmed and stored as plain text.

Body for daily habits:

```json
{
  "title": "Run",
  "description": "",
  "category": "Health",
  "plan": "daily",
  "color": "gray"
}
```

Body for weekly habits:

```json
{
  "title": "Read",
  "description": "",
  "category": "Learning",
  "plan": "weekly",
  "weeklyTarget": 3,
  "color": "blue"
}
```

Responses:

- `201`: Habit created.
- `400`: Invalid habit data or habit limit reached.
- `401`: Unauthorized.
- `429`: Too many requests.

## List Habits

`GET /api/habits`

Returns habits for the authenticated user, sorted by `createdAt desc`.

Responses:

- `200`: Habits found.
- `401`: Unauthorized.

## Get Habit

`GET /api/habits/:habitId`

Returns one habit for the authenticated user.

Responses:

- `200`: Habit found.
- `401`: Unauthorized.
- `404`: Habit not found.

## Update Habit

`PATCH /api/habits/:habitId`

Updates editable habit fields for the authenticated user.

Editable fields:

- `title`
- `description`
- `category`
- `color`

`plan` and `weeklyTarget` cannot be changed after creation.

Body:

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "category": "Health",
  "color": "blue"
}
```

Responses:

- `200`: Habit updated.
- `400`: Invalid habit data.
- `401`: Unauthorized.
- `404`: Habit not found.

## Delete Habit

`DELETE /api/habits/:habitId`

Deletes a habit for the authenticated user.

Responses:

- `200`: Habit deleted.
- `401`: Unauthorized.
- `404`: Habit not found.

## Upsert Habit Check-in

`PUT /api/habits/:habitId/checkins/:date`

Creates or updates the check-in count for one date. The date must use
`YYYY-MM-DD` and must be today or yesterday.

Daily habits allow `count` from `0` to `1`. Weekly habits allow `count` from
`0` to `14`. The update is written atomically for the given habit and date.

Body:

```json
{
  "count": 1
}
```

Responses:

- `200`: Habit check-in updated.
- `400`: Invalid check-in data or date.
- `401`: Unauthorized.
- `404`: Habit not found.

## Delete Habit Check-in

`DELETE /api/habits/:habitId/checkins/:date`

Removes the check-in for one date. The date must use `YYYY-MM-DD` and must be
today or yesterday. The removal is written atomically.

Responses:

- `200`: Habit check-in deleted.
- `400`: Invalid check-in date.
- `401`: Unauthorized.
- `404`: Habit not found.

## Get Habit Stats

`GET /api/habits/:habitId/stats`

Returns the current progress and simple total stats for one habit.

Daily stats include today's status and the current daily streak. Weekly stats
include the current Monday-Sunday week progress.

Daily response shape:

```json
{
  "habitId": "507f1f77bcf86cd799439011",
  "plan": "daily",
  "current": {
    "type": "daily",
    "date": "2026-05-08",
    "count": 1,
    "completed": true,
    "streak": 2
  },
  "totals": {
    "totalCheckins": 2,
    "checkedInDays": 2,
    "successRate": 100
  }
}
```

Weekly response shape:

```json
{
  "habitId": "507f1f77bcf86cd799439011",
  "plan": "weekly",
  "current": {
    "type": "weekly",
    "startDate": "2026-05-04",
    "endDate": "2026-05-10",
    "count": 3,
    "target": 4,
    "remaining": 1,
    "completed": false
  },
  "totals": {
    "totalCheckins": 3,
    "checkedInDays": 2,
    "successRate": 75
  }
}
```

Responses:

- `200`: Habit stats found.
- `401`: Unauthorized.
- `404`: Habit not found.
