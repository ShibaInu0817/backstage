
1. Global exception filter, currently manually catch in controller
2. Response interceptor:

```
Option C: Industry standard (JSON:API / Problem Details RFC 7807)

Success:

{
  "data": {
    "id": "123",
    "content": "Hello"
  }
}


Error (RFC 7807 style):

{
  "type": "https://example.com/errors/message-not-found",
  "title": "Message not found",
  "status": 404,
  "detail": "Message with id 123 does not exist"
}


✅ Standardized, widely understood by tools & clients.

✅ Rich error format (type, detail, status).

✅ Plays well with microservices / APIs consumed by many clients.

❌ More verbose.

❌ Overkill for small internal projects.

👉 Best if you want standards compliance and long-term maintainability.
```

Continue discussion with ChatGPT:
https://chatgpt.com/share/68bdbee3-8cec-8006-ae80-ab24482866ab$
