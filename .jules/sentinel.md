## 2024-04-23 - Prevent SQL wildcard injection in SQLite LIKE queries
**Vulnerability:** Unescaped user input passed to SQLite LIKE queries (e.g. `%${search}%`) allows users to inject `%` and `_` wildcards, potentially causing DoS (complex wildcards) or bypassing intended filters.
**Learning:** `req.query` params are not sanitized by default. SQLite doesn't escape wildcards automatically.
**Prevention:** Always explicitly escape wildcard characters ('%' and '_') and the escape character itself ('\') before interpolating into the LIKE parameter. Also explicitly use `ESCAPE '\'` in the SQL query since SQLite doesn't have a default escape character.
