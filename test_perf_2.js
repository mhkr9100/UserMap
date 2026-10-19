const MARKERS = [
  /\blet'?s (use|go with|try|pick|choose|switch to)\b/ig,
  /\bwe (should|decided|chose|went with|picked|settled on)\b/ig,
  /\bi'?m going (to|with)\b/ig,
];

function scoreMarkersOld(text, markers) {
  let score = 0;
  const textLower = text.toLowerCase();
  for (const m of markers) {
    const matches = textLower.match(new RegExp(m.source, 'gi'));
    if (matches) score += matches.length;
  }
  return score;
}

function scoreMarkersNew(text, markers) {
  let score = 0;
  for (const m of markers) {
    const matches = text.match(m);
    if (matches) score += matches.length;
  }
  return score;
}

const text = "Let's go with the new approach. I'm going with React. We decided not to.";

console.time('old');
for (let i = 0; i < 10000; i++) {
  scoreMarkersOld(text, MARKERS);
}
console.timeEnd('old');

console.time('new');
for (let i = 0; i < 10000; i++) {
  scoreMarkersNew(text, MARKERS);
}
console.timeEnd('new');
