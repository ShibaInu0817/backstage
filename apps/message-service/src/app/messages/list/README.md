# List Messages by Conversation ID API

## Overview

This API endpoint provides a comprehensive solution for listing messages by conversation ID with **cursor-based pagination**, filtering, and sorting capabilities following NestJS and Mongoose best practices. Cursor-based pagination is ideal for infinite scroll patterns in conversation UIs.

## API Endpoint

```
GET /v1/messages?conversationId={conversationId}&limit=20
GET /v1/messages?conversationId={conversationId}&limit=20&cursor={cursor}
```

## Features

- ✅ **Cursor-based pagination** for infinite scroll
- ✅ Superior performance (no expensive skip operations)
- ✅ Consistent results when new messages are added
- ✅ Sorting by any field (default: timestamp DESC)
- ✅ Multiple filtering options:
  - Conversation ID (required)
  - Tenant ID
  - Sender ID
  - Date range (start/end date)
  - Full-text search
- ✅ Optimized MongoDB queries with compound indexes
- ✅ Type-safe implementation with TypeScript
- ✅ Validation using class-validator
- ✅ Swagger/OpenAPI documentation

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `conversationId` | string | Yes | - | The conversation ID to filter messages |
| `tenantId` | string | No | - | Filter by tenant ID |
| `senderId` | string | No | - | Filter by sender ID |
| `startDate` | ISO 8601 | No | - | Filter messages from this date |
| `endDate` | ISO 8601 | No | - | Filter messages until this date |
| `searchText` | string | No | - | Full-text search in message content |
| `cursor` | string | No | - | Cursor for pagination (base64 encoded) |
| `limit` | number | No | 20 | Items to return (min: 1, max: 100) |
| `sortBy` | string | No | timestamp | Field to sort by |
| `sortOrder` | enum | No | desc | Sort order: 'asc' or 'desc' |

## Request Examples

### Initial Request (No Cursor)
```bash
curl -X GET "http://localhost:3000/v1/messages?conversationId=507f1f77bcf86cd799439011&limit=20"
```

### Load More (With Cursor)
```bash
curl -X GET "http://localhost:3000/v1/messages?conversationId=507f1f77bcf86cd799439011&limit=20&cursor=eyJ0aW1lc3RhbXAiOjE2OTc..."
```

### With Filters
```bash
curl -X GET "http://localhost:3000/v1/messages?conversationId=507f1f77bcf86cd799439011&tenantId=tenant123&senderId=user456&limit=20"
```

### With Date Range
```bash
curl -X GET "http://localhost:3000/v1/messages?conversationId=507f1f77bcf86cd799439011&startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.999Z"
```

### With Text Search
```bash
curl -X GET "http://localhost:3000/v1/messages?conversationId=507f1f77bcf86cd799439011&searchText=hello%20world"
```

### With Custom Sorting
```bash
curl -X GET "http://localhost:3000/v1/messages?conversationId=507f1f77bcf86cd799439011&sortBy=senderId&sortOrder=asc"
```

## Response Format

```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "conversationId": "507f1f77bcf86cd799439011",
      "senderId": "user123",
      "content": "Hello, world!",
      "tenantId": "tenant123",
      "timestamp": "2024-10-12T10:30:00.000Z",
      "metadata": {
        "read": true
      }
    }
  ],
  "pagination": {
    "limit": 20,
    "hasMore": true,
    "nextCursor": "eyJ0aW1lc3RhbXAiOjE2OTc0MjgwMDAwMDAsIl9pZCI6IjY1MzE2YzA5ZjczZmY2MTEzMDk1ODI2ZCJ9",
    "previousCursor": null
  }
}
```

## How Cursor Pagination Works

### Cursor Structure

The cursor is a base64-encoded JSON object containing:
- The sort field value (e.g., timestamp)
- The document `_id` for tie-breaking

Example decoded cursor:
```json
{
  "timestamp": "2024-10-12T10:30:00.000Z",
  "_id": "65316c09f73ff611309582 6d"
}
```

### Pagination Flow

1. **Initial Request**: No cursor provided, returns first page
2. **Load More**: Use `nextCursor` from previous response
3. **Has More**: Check `hasMore` to determine if more results exist
4. **Infinite Scroll**: Continue using `nextCursor` until `hasMore` is false

## Implementation Details

### Architecture Layers

The implementation follows clean architecture principles with clear separation of concerns:

1. **Domain Layer** (`libs/messages/messages-domain`)
   - Repository interface with pagination types
   - Domain entities
   - Pagination and filtering interfaces

2. **Infrastructure Layer** (`libs/messages/messages-infra`)
   - MongoDB/Mongoose repository implementation
   - Optimized queries with proper indexing
   - Data mapping between domain entities and database models

3. **Application Layer** (`apps/api-gateway`)
   - Use case orchestration
   - Input validation
   - Controller endpoints

### Key Files

- `libs/messages/messages-domain/src/lib/entities/messages/repository.interface.ts`
  - Defines pagination interfaces and repository contract
  
- `libs/messages/messages-infra/src/lib/repositories/message/repository.ts`
  - Implements pagination logic with Mongoose
  
- `apps/api-gateway/src/app/messages/list/query.dto.ts`
  - Request validation and transformation
  
- `apps/api-gateway/src/app/messages/list/use-case.ts`
  - Business logic orchestration
  
- `apps/api-gateway/src/app/messages/list/controller.ts`
  - HTTP endpoint handling

### Database Optimization

The implementation leverages existing compound indexes for efficient queries:

```typescript
// Existing indexes in schema.ts
MessageSchema.index({ conversationId: 1, timestamp: -1 });
MessageSchema.index({ content: 'text' });
MessageSchema.index({ tenantId: 1, conversationId: 1 });
```

These indexes optimize:
- Conversation-based queries with timestamp sorting
- Full-text search on message content
- Multi-tenant filtering

### Best Practices Implemented

1. **Cursor-Based Pagination**
   - No expensive skip operations
   - Consistent results during data changes
   - Ideal for infinite scroll UIs
   - Base64-encoded cursors for security

2. **Performance**
   - Single optimized query (no separate count)
   - Efficient MongoDB queries with proper indexing
   - Limit + 1 pattern to determine hasMore
   - Limit max page size to 100 items

3. **Validation**
   - All query parameters validated with class-validator
   - Type transformation with class-transformer
   - API documentation with Swagger decorators

4. **Type Safety**
   - Strongly typed throughout the stack
   - Interface-based repository pattern
   - Enum for sort order

5. **Error Handling**
   - Input validation errors automatically handled
   - 400 status for invalid parameters
   - Proper error responses

## Testing the API

You can test the API using:

1. **Swagger UI** (if enabled)
   - Navigate to `/api/docs`
   - Use the interactive API explorer

2. **curl** (see examples above)

3. **HTTP Client** (Postman, Insomnia, etc.)

## Performance Considerations

- **Cursor-based pagination** provides consistent O(1) performance regardless of dataset size
- No expensive skip operations - significantly faster than offset-based pagination
- Single query pattern is more efficient than separate count + data queries
- The compound indexes (conversationId + timestamp) optimize cursor queries perfectly
- Fetches limit + 1 items to efficiently determine if more results exist

## Advantages Over Offset-Based Pagination

1. **Performance**: No skip operations - same speed for first and millionth page
2. **Consistency**: New messages don't cause duplicates or missing items
3. **Scalability**: Works efficiently with millions of messages
4. **UX**: Perfect for infinite scroll and "load more" patterns

## Use Cases

**Ideal For:**
- Chat/messaging interfaces
- Social media feeds
- Activity logs
- Any list with continuous scrolling

**Not Ideal For:**
- Page number navigation (e.g., "Go to page 5")
- Showing total count or total pages
- Random access to specific pages

## Future Enhancements

Potential improvements for future iterations:
- Response caching with Redis
- Rate limiting per conversation
- Real-time updates with WebSockets
- Message aggregation queries
- Backward pagination support
- Export functionality

