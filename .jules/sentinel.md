## Sentinel Journal
## 2025-02-28 - Explicitly Escape Backslash and Wildcards in SQLite LIKE Queries

**Vulnerability:** The SQLite `LIKE` operator does not automatically escape the backslash (`\`) escape character itself or the wildcard characters (`%`, `_`) unless configured to do so with an `ESCAPE '\'` clause and explicitly replaced in JS user input using regex `String(input).replace(/[\\%_]/g, '\\$&')`. Using unescaped search strings passed from query params in an Express server enables wildcard injection and Denial-of-Service attacks.

**Learning:** Replacing only `%` and `_` (`.replace(/[%_]/g, '\\$&')`) is insufficient because a user input of just `\` bypasses this regex, resulting in `\`, which when prepended/appended with `%` evaluates to `%\%`. This throws a syntax error if SQLite explicitly interprets `\` as an escape character but is missing a following character to escape, or it causes DoS. The correct approach is replacing `\` as well with `/[\\%_]/g`. Explicit string casting (`String(search)`) is also required to avoid crashes if Express passes an array/object instead of a string in `req.query`.

**Prevention:** When constructing SQLite `LIKE` queries with user input, always append ` ESCAPE '\'` to the `LIKE ?` clause in SQL, and use `String(input).replace(/[\\%_]/g, '\\$&')` in JavaScript before injecting into the SQL query parameters.
