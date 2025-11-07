# Boilerplate

Please refer to the [todo.md](todo.md) file for the tasks to be done.



### When generating a new application
- add tags to the application
- remove rootDir from tsconfig.app.json
- nx reset && nx sync
- modified main.ts


## Reasoning for the architecture
### 1. Why use command bus instead of directly calling the use cases?

 > Primary Reason: Architectural Consistency with Event-Driven CQRS
https://barryvanveen.nl/articles/49-what-is-a-command-bus-and-why-should-you-use-it/

| Benefit                                     | Description                                                                                                                                                      | Example                                                                                        |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **1. Decouples caller from implementation** | The caller (controller, saga, or event handler) doesn’t know *which class* executes the command. You can replace or modify handlers without touching the caller. | Controller sends `CreateOrderCommand` — doesn’t care who handles it.                           |
| **2. Enforces explicit intent**             | Commands represent business actions clearly (“CreateOrder”, “CancelBooking”) rather than generic method calls.                                                   | You read system intent like business language.                                                 |
| **3. Centralized orchestration**            | The CommandBus routes all commands — making it easier to apply middleware (logging, validation, transactions, etc.) uniformly.                                   | Add logging or tracing globally to all commands.                                               |
| **4. Simplifies testing and consistency**   | You can test command handlers in isolation — each is a self-contained “use case” with no external dependencies.                                                  | Unit-test `CreateOrderHandler` directly.                                                       |
| **5. Enables future extensibility**         | You can later trigger commands from sagas or message queues without refactoring.                                                                                 | Tomorrow, `PaymentSucceededEvent` → triggers `CommandBus.execute(new CompleteOrderCommand())`. |
| **6. Fits into CQRS cleanly**               | It gives you symmetry: `CommandBus` for writes, `QueryBus` for reads.                                                                                            | Keeps architecture predictable.                                                                |


### 2. Why use unit of work?

 > Primary Reason: To ensure data consistency and integrity across multiple database operations, not limited to MongoDB. Also, we want to keep the domain layer free from infrastructure concerns.


### 3. Module hierachy for commands.

#### Flow: Layer Separation

```
┌─────────────────────────────────────┐
│   HTTP Layer (api-gateway)          │
│   - Controllers, DTOs, HTTP concerns│
└────────────┬────────────────────────┘
             │ dispatches command
             ▼
┌─────────────────────────────────────┐
│   Application Layer (messages-app)  │
│   - Handlers, Commands (pure logic) │
└────────────┬────────────────────────┘
             │ depends on interfaces
             ▼
┌─────────────────────────────────────┐
│   Infrastructure Layer (infra)      │
│   - Repositories, DB, Kafka, etc.   │
└─────────────────────────────────────┘
```

#### File Structure

```
libs/messages/messages-application/src/lib/commands/create-message/
├── create-message.command.ts      # Command DTO
├── create-message.handler.ts      # Business logic (pure)
├── create-message.module.ts       # Feature module (imports CqrsModule only)
└── create-message.errors.ts       # Application errors

apps/api-gateway/src/app/messages/create/
├── controller.ts                  # HTTP layer (dispatches commands)
├── dto.ts                         # Request/response validation
└── module.ts                      # Composition root (wires handler + infra)
```

#### Key Principles

| Layer            | Location              | Responsibility                  | Dependencies           |
| ---------------- | --------------------- | ------------------------------- | ---------------------- |
| **HTTP**         | `api-gateway`         | Controllers, DTOs, HTTP         | Application layer      |
| **Application**  | `messages-application` | Handlers, Commands              | Domain interfaces only |
| **Infrastructure** | `messages-infra`    | Concrete implementations        | DB, Kafka, etc.        |
| **Domain**       | `messages-domain`     | Entities, Value Objects         | None (pure)            |

**Composition Root:** The app module (e.g., `api-gateway`) is the only place that knows about all layers. It imports feature modules (handlers) and infrastructure modules (concrete implementations), letting NestJS DI wire them together via tokens. This keeps the application layer pure and infrastructure pluggable.

### 4. Why so many modules? What is the differences?

The modules are following DDD practices, it follow the pattern: 
```
Root → Bounded Context → Use Case → Infrastructure.
```

| Module | Layer | Responsibility |
|--------|-------|----------------|
| `app.module.ts` | Application Root | Bootstrap entire app |
| `messages/module.ts` | **Bounded Context Aggregate** | **Group all features for Messages domain** |
| `create/module.ts` | Use Case/Application | Orchestrate single feature |
| `messages-infra/module.ts` | Infrastructure | Technical implementations |


### 5. Architecture Diagram
The messages service is a bounded context, handling CRUD controllers with command handlers. It will trigger outbox cdc and publish to kafka.

   **Same bounded context:**
   - Commands → Write to DB + Outbox
   - CDC → Publish events
   - Consumers → Update read models ← Same service queries these
   - Queries → Read from read models

The kafka consumer can be splited into a new service `messages-event-processor` when:
  - When event processing becomes heavy (ML, external APIs)
  - When 5+ services need to consume the same events
  - When you need different teams for write vs read

The architecture diagram is as follows:

                              ┌─────────────────────┐
                              │    API Gateway      │
                              │  (Port 3000)        │
                              └──────────┬──────────┘
                                         │ HTTP
                                         ▼
                              ┌─────────────────────┐
                              │  Messages Service   │
                              │  (Port 3001)        │
                              ├─────────────────────┤
                              │ • REST Controllers  │
                              │ • Command Handlers  │
                              │ • Query Handlers    │
                              │ • Write DB + Outbox │
                              │                     │
                              │ • Kafka Consumers   │◄──────┐
                              │ • Update Read Models│       │
                              └─────────┬───────────┘       │
                                        │                   │
                                        │ write             │ consume
                                        ▼                   │
                              ┌─────────────────────┐       │
                              │      MongoDB        │       │
                              ├─────────────────────┤       │
                              │ • messages (write)  │       │
                              │ • outbox (shared)   │       │
                              │ • processed_events  │       │
                              └─────────┬───────────┘       │
                                        │                   │
                                        │ CDC               │
                                        │ (change stream)   │
                                        ▼                   │
                              ┌─────────────────────┐       │
                              │  Event Publisher    │       │
                              │  (Port 3002)        │       │
                              ├─────────────────────┤       │
                              │ • Watch Outbox      │       │
                              │ • Publish to Kafka  │       │
                              │ • Mark as SENT      │       │
                              └─────────┬───────────┘       │
                                        │                   │
                                        │ publish           │
                                        ▼                   │
                              ┌─────────────────────┐       │
                              │       Kafka         │       │
                              │  Topic:             │       │
                              │  - message.created  │───────┘
                              │  - message.updated  │
                              └─────────────────────┘

## References
https://github.com/Sairyss/domain-driven-hexagon?tab=readme-ov-file#commands
