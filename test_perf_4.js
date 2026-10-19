const regexes = [
  /\blet'?s (use|go with|try|pick|choose|switch to)\b/ig,
  /\bwe (should|decided|chose|went with|picked|settled on)\b/ig,
  /\bi'?m going (to|with)\b/ig,
];

let score = 0;
const text = "Let's go with this. We decided on that. I'm going with another.";
for (let i = 0; i < 100; i++) {
  for (const m of regexes) {
    const matches = text.match(m);
    if (matches) score += matches.length;
  }
}
console.log(score);
