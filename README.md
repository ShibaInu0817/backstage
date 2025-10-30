# Boilerplate

Please refer to the [todo.md](todo.md) file for the tasks to be done.



### When generating a new application
- add tags to the application
- remove rootDir from tsconfig.app.json
- nx reset && nx sync
- modified main.ts


## Reasoning for the architecture
1. Why use command bus instead of directly calling the use cases?

 > Primary Reason: Architectural Consistency with Event-Driven CQRS
https://barryvanveen.nl/articles/49-what-is-a-command-bus-and-why-should-you-use-it/

2. Why use unit of work?

 > Primary Reason: To ensure data consistency and integrity across multiple database operations, not limited to MongoDB. Also, we want to keep the domain layer free from infrastructure concerns.


## References
https://github.com/Sairyss/domain-driven-hexagon?tab=readme-ov-file#commands
