## 2024-05-15 - [SQLite LIKE Query Vulnerabilities]
**Vulnerability:** SQLite `LIKE` queries were vulnerable to wildcard injection via unsanitized user input containing '%' and '_'.
**Learning:** SQLite's `LIKE` operator processes '%' and '_' as wildcards, which can lead to excessive processing time (DoS risk) or unintentional exposure of data when they occur in user search inputs. The backslash character also needs to be escaped.
**Prevention:** Always escape '\', '%', and '_' in user inputs passed to SQLite `LIKE` queries and append `ESCAPE '\\'` to the query.
