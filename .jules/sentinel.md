## YYYY-MM-DD - Fix SQL LIKE Wildcard Injection
**Vulnerability:** Unescaped user input used in SQL LIKE queries.
**Learning:** SQLite LIKE queries are vulnerable to wildcard injections ('%' and '_') leading to DoS or bypasses. The ESCAPE keyword must be used and the escape character must be a single character literal in SQL (`ESCAPE '\'`).
**Prevention:** Always escape `%` and `_` characters in user inputs used in LIKE clauses and explicitly append `ESCAPE '\'` to the SQL query.
