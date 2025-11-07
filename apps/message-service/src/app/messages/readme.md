This is a microservices method of handling messages and this module only publishing the commands to the command bus.

Flows:
Controllers --> Commands --> Command Handlers --> Repositories --> Domain Entities --> Database
