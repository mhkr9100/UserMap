## 2024-03-22 - HTTP Parameter Pollution & SQLite LIKE Wildcard DoS
**Vulnerability:** Express `req.query` parameters were cast to strings but could actually be arrays, causing `q.trim()` to crash or breaking SQL parameters (`Too many parameter values`). Also, `search` text in `logs.ts` was not escaped for SQLite `LIKE`, allowing wildcard DoS.
**Learning:** Always explicitly validate that query params are strings (e.g. `typeof q === 'string'`) before using them. Also, explicit escaping of `%`, `_`, and `\` must be added along with `ESCAPE '\'` when doing `LIKE` queries to prevent abuse.
**Prevention:** Use `typeof` checks for HTTP parameter pollution, and implement `.replace(/[%_\\]/g, '\\$&')` combined with `ESCAPE '\'` for any `LIKE` clauses handling user input.
