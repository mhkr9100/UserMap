## 2024-05-24 - Logs Wildcard Injection
**Vulnerability:** SQL `LIKE` wildcard injection in logs search
**Learning:** User input used in `LIKE` queries needs to be properly escaped to avoid denial-of-service (DoS) or unexpected data leaks.
**Prevention:** Always escape `%`, `_`, and `\` characters in user input and use `ESCAPE '\'` in the SQL `LIKE` condition.
