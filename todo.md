Tips:

1. Use Case should decide what error to be thrown, either domain or application error. 
2. Infra error should be wrapped into application error.


TODO:
1. Backstage auth - https://backstage.io/docs/getting-started/config/authentication/
2. Add message queue and command processor
3. Add CQRS pattern - https://chatgpt.com/share/68d0a69a-21c8-8006-9c46-c80a57152d13
- Add query handler for get and list
- Add command handler for create and update
- outbox repository
- setup kafka and cdc
- outbox cdc
- 
1. Add test for repository pattern
2. Add prompt or full document for the flows


What had been done:
1. Setup backstage portal and docker for app
2. Response handling and exception filter using `HttpModule`
3. Repository pattern
4. Add List and pagination sample
4. Add Swagger documentation


