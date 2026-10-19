## 2025-02-28 - HTTP Parameter Pollution and SQL LIKE Injection

**Vulnerability:** Type confusion via HTTP Parameter Pollution (HPP) in `req.query` variables and uncontrolled resource consumption via unescaped SQLite `LIKE` wildcards.
**Learning:** `req.query` in Express is typed broadly and parsing allows arrays/objects to silently pass through to string manipulation functions (`trim`) or DB queries, causing crashes. Furthermore, `LIKE` clauses in SQLite treat `%` and `_` as wildcards unless explicitly escaped with `ESCAPE '\'`, enabling attackers to force expensive full-table scans.
**Prevention:** Explicitly assert `typeof input === 'string'` for all query parameter strings prior to consumption and explicitly handle fallback numeric type limits using `Number.isNaN`. Apply `.replace(/[%_\\]/g, '\\$&')` and append `ESCAPE '\'` to any user-provided string incorporated into a `LIKE` clause.
