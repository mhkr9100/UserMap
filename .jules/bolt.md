## 2024-05-18 - Avoid RegExp constructor in tight loops
**Learning:** In \`prismMemoryExtractor.ts\`, dynamically allocating RegExp objects inside a scoring loop (\`scoreMarkers\`) using \`new RegExp(m.source, 'gi')\` caused unnecessary memory allocation and CPU overhead.
**Action:** Pre-compile marker arrays with the 'g' flag and use \`string.match(m)\` directly to skip dynamic regex parsing and object instantiation during memory extraction.
