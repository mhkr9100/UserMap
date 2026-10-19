## 2025-02-27 - Fast Date Parsing with Schwartzian transform
**Learning:** Calling \`new Date().getTime()\` inside the \`Array.prototype.sort()\` callback executes parsing O(N log N) times, which is a significant bottleneck for large arrays.
**Action:** Use a Schwartzian transform to map array items with their parsed timestamps upfront, sort the mapped array based on the timestamps O(N log N) times without date parsing overhead, and extract the original items from the sorted mapped array.
