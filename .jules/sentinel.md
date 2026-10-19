## 2024-05-15 - Express HTTP Parameter Pollution
**Vulnerability:** Express `req.query` properties can be arrays/objects. Passing these into `trim()` or database drivers (`better-sqlite3`) causes synchronous TypeError crashes, enabling DoS attacks.
**Learning:** Blindly casting with `String()` is unsafe because `String(undefined)` evaluates to `"undefined"`. The safe approach is explicit type checking: `typeof req.query.param === "string"`.
**Prevention:** Always validate `req.query` variables using `typeof x === "string"` before use in APIs.
