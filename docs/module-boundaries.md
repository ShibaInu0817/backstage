## DDD Module Boundaries

### Layering rules (from ESLint)
- **Domain (`layer:domain`)**: may depend only on **Domain**.
- **Application (`layer:application`)**: may depend on **Domain** and **Application**.
- **Infrastructure (`layer:infra`)**: may depend on **Domain** and **Infrastructure**.
- **Apps (`type:app`)**: may depend on **Domain**, **Application**, and **Infrastructure** (composition root).


### Tags in use

#### Applications
- `@boilerplate/api-gateway`: `type:app`

#### Libraries
- `@boilerplate/messages-domain`: `scope:messages`, `layer:domain`
- `@boilerplate/messages-application`: `scope:messages`, `layer:application`
- `@boilerplate/messages-infra`: `scope:messages`, `layer:infra`
- `@boilerplate/infra` (shared): `scope:shared`, `layer:infra`

#### Tag glossary
- `type:app` — Nx application projects (composition root)
- `layer:domain` — Domain layer (entities, value objects, domain services)
- `layer:application` — Application layer (use cases, orchestrations)
- `layer:infra` — Infrastructure layer (adapters, persistence, external IO)
- `scope:messages`, `scope:shared` — Functional scopes for grouping libraries

