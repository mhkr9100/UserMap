## 2025-05-18 - Express Type Confusion DoS
**Vulnerability:** Express `req.query` values can be passed as arrays or objects, which causes type-related crashes (e.g., `TypeError: str.replace is not a function`) when string methods are called directly on them. This leads to unhandled exceptions and DoS vulnerabilities.
**Learning:** Never assume `req.query` values are strings even when cast via TypeScript (`as Record<string, string>`). TypeScript types don't enforce runtime checks.
**Prevention:** Always explicitly cast user input to string (e.g., `String(input)`) before applying string manipulation methods.
