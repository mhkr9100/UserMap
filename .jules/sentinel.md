## 2024-05-18 - [Fix SQLite Wildcard Injection DoS]
**Vulnerability:** SQLite `LIKE` statements were processing unescaped wildcard characters (`%` and `_`) from unsanitized user inputs, opening the door for wildcard injection.
**Learning:** This wildcard injection could be exploited to induce Denial of Service (DoS) attacks by crafting requests full of wildcard characters and taking advantage of potentially unoptimized regex processing in SQLite query evaluation.
**Prevention:** Always explicitly escape user inputs involving `%` and `_` characters before passing them to SQLite `LIKE` clauses, and append `ESCAPE '\'` directly within the query.
