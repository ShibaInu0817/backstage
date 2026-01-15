# Update Message Flow

## Description

Updates the content or metadata of an existing message within a conversation. The flow follows the **Command Handler Pattern** with transactional support via Unit of Work and implements **Optimistic Locking** to prevent lost updates.

### Path Parameters

| Parameter        | Type     | Required | Description                |
| ---------------- | -------- | -------- | -------------------------- |
| `conversationId` | `string` | Yes      | The conversation identifier|
| `id`             | `string` | Yes      | The message identifier     |

### Request Body

| Field      | Type                   | Required | Description                         |
| ---------- | ---------------------- | -------- | ----------------------------------- |
| `tenantId` | `string`               | Yes      | The tenant identifier               |
| `content`  | `string`               | No       | The updated message content         |
| `metadata` | `Record<string, any>`  | No       | Optional metadata key-value pairs   |

#### Example

```http
PATCH /v1/message/conversations/conv-12345/messages/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "tenantId": "tenant-001",
  "content": "Updated message content",
  "metadata": {
    "priority": "low"
  }
}
```

### Response

Returns the updated `MessageResponseDto`.

#### Example
```json
{
  "id": "507f1f77bcf86cd799439011",
  "tenantId": "tenant-001",
  "conversationId": "conv-12345",
  "senderId": "user-789",
  "content": "Updated message content",
  "timestamp": "2025-12-13T10:30:00.000Z",
  "metadata": {
    "priority": "low"
  }
}
```

### Error Handling

| Error                 | Code                    | Description                                         |
| --------------------- | ----------------------- | --------------------------------------------------- |
| `NotFoundException`   | `404 Not Found`         | Message with the given ID not found                 |
| `OptimisticLockError` | `OPTIMISTIC_LOCK_ERROR` | Concurrency conflict (record updated by another process) |
| `Error`               | `BadRequest`            | Tenant ID or Conversation ID mismatch with the record |

## Flow

1. **Controller** (`UpdateMessageController`)
   - Receives PATCH request at `/v1/message/conversations/:conversationId/messages/:id`
   - Validates input via `UpdateMessageDto`
   - Constructs `UpdateMessageCommand`
   - Dispatches command via `CommandBus`

2. **Command Handler** (`UpdateMessageHandler`)
   - Executes within a database transaction (`UnitOfWork`)
   - Fetches current message via `MessageRepository.findById()`
   - Validates `tenantId` and `conversationId` against the existing record
   - Updates entity state via `message.update()`
   - Persists changes via `MessageRepository.update()`

3. **Domain Entity** (`MessageEntity`)
   - `update()` method modifies content/metadata and performs domain validation
   - Centralizes state modification logic

4. **Repository** (`MessageRepository`)
   - Performs atomic update using MongoDB's `findOneAndUpdate`
   - Filter includes `_id`, `tenantId`, `conversationId`, and the current `version`
   - Atomicly increments the `version` field

## Sequence Diagram

```mermaid
sequenceDiagram
    participant Client
    participant Controller as UpdateMessageController
    participant CommandBus
    participant Handler as UpdateMessageHandler
    participant UoW as UnitOfWork
    participant Repo as MessageRepository
    participant DB as MongoDB

    Client->>Controller: PATCH /conversations/:cId/messages/:id
    Controller->>Controller: Validate UpdateMessageDto
    Controller->>CommandBus: execute(UpdateMessageCommand)
    CommandBus->>Handler: execute(command)
    
    Handler->>UoW: executeInTransaction()
    activate UoW
    
    Handler->>Repo: findById(id)
    Repo->>DB: findOne({ _id })
    DB-->>Repo: document
    Repo-->>Handler: MessageEntity
    
    Handler->>Handler: Validate tenant & conversation
    Handler->>Handler: message.update(content, metadata)
    
    Handler->>Repo: update(message, uow)
    Repo->>DB: findOneAndUpdate({ _id, v, t, c }, { $set, $inc: v })
    
    alt Success
        DB-->>Repo: updated document
        Repo-->>Handler: updatedMessage
        deactivate UoW
        Handler-->>CommandBus: MessageEntity
        CommandBus-->>Controller: MessageEntity
        Controller-->>Client: MessageResponseDto
    else Conflict/Not Found
        DB-->>Repo: null
        Repo-->>Handler: throw OptimisticLockError
        deactivate UoW
        Handler-->>Client: Error Response
    end
```
