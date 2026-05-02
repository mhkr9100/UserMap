
## 2025-05-02 - Missing escape character in SQL LIKE wildcard injection defense
**Vulnerability:** A previous patch to escape user input in SQL LIKE queries (using `/[%_]/g`) failed to escape the backslash (`\`) itself. This allowed an attacker to input `\%`, which was escaped to `\\%`, but because the backslash escapes itself, the `%` remained unescaped and active as a wildcard.
**Learning:** When defending against SQL LIKE wildcard injection, you must escape the `ESCAPE` character itself in addition to the `%` and `_` wildcards.
**Prevention:** Always use `/[%_\\]/g` in your regex replace when escaping LIKE queries in JS, and ensure the ESCAPE clause is exactly one character literal in SQLite (e.g. `ESCAPE '\\'`).
