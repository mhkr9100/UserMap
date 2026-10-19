## 2025-05-04 - Fix LIKE Query Injection
**Vulnerability:** User-controlled inputs in `LIKE` expressions across the codebase (specifically in `apps/server/src/routes/context.ts` and `apps/server/src/routes/logs.ts`) failed to escape the literal backslash (`\`) character, and sometimes lacked the `ESCAPE '\\'` SQL clause entirely.
**Learning:** By not escaping the backslash, an attacker could input an unescaped `%` or `_` (e.g. `\%`), leading to wildcards being processed. This can lead to heavy database load (DoS) or unintended information disclosure in searches.
**Prevention:** Always use `.replace(/[%_\\]/g, '\\$&')` to escape `%`, `_`, and `\` in user inputs intended for `LIKE` clauses, and ensure the SQL query explicitly includes `ESCAPE '\\'`.
