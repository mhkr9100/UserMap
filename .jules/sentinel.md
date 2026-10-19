## 2024-05-26 - Fix HTTP Parameter Pollution and SQL LIKE wildcard injection
**Vulnerability:** `req.query` array parameter injection via Express causing DoS (TypeErrors/implicit `better-sqlite3` array unpacking) and SQLite `LIKE` wildcard character injection (ReDoS / Exfiltration risk).
**Learning:** Destructuring `req.query` without verifying string types enables array manipulation in SQLite bindings and string templates. Wildcards `%`, `_` in `LIKE` must be manually escaped with `ESCAPE '\\'` as SQLite driver doesn't sanitize `LIKE` patterns.
**Prevention:** Always validate `typeof queryParam === 'string'` for Express `req.query` inputs and use `Number.isNaN` for fallbacks. Escape strings in SQLite `LIKE` queries using `.replace(/[%_\\]/g, '\\$&')` coupled with `ESCAPE '\\'`.
