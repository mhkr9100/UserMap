## 2025-05-19 - Type-coercion vulnerability via Express Query Parameters (HTTP Parameter Pollution)
**Vulnerability:** HTTP Parameter Pollution allowing bypass of expected string validations in `req.query`.
**Learning:** Typecasting `req.query` with `as Record<string, string>` in TypeScript does not prevent an attacker from sending an array of values (e.g. `?search[]=a&search[]=b`). Express automatically parses these as arrays. This causes `typeof search` to evaluate as `object`, which circumvents string-based `.trim()`, `.replace()`, etc., or when passed into `better-sqlite3` parameter arrays, it causes a crash (denial of service).
**Prevention:** Always check `typeof param === 'string'` before using `param` from `req.query`, or use a validation library to enforce the expected type.
