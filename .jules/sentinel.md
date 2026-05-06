## 2024-05-06 - SQL LIKE Injection in logs endpoint
**Vulnerability:** The `/api/logs` endpoint used unescaped user input in a SQL `LIKE` clause (`summary LIKE ? OR ...` with `%${search}%`).
**Learning:** SQLite's `LIKE` operator treats `%` and `_` as wildcards. If user input isn't escaped, an attacker can input wildcards causing the DB to perform unexpected and potentially expensive wildcard searches (DoS risk).
**Prevention:** Always escape `%`, `_`, and `\` in user input using `.replace(/[%_\\]/g, '\\$&')` and append `ESCAPE '\'` to the `LIKE` clause in the SQL query.
