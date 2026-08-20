const RULES = [
  { name: "email", pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, replacement: "[EMAIL]" },
  { name: "phone", pattern: /\b(?:\+?\d[\d\s().-]{7,}\d)\b/g, replacement: "[PHONE]" },
  { name: "token", pattern: /\b(?:sk(?:-[A-Za-z0-9]+)?|ghp|github_pat|xoxb|xapp)_[A-Za-z0-9_-]+\b/gi, replacement: "[TOKEN]" },
  { name: "secret", pattern: /\b(?:password|passwd|api[_-]?key|authorization|bearer)\s*[:=]\s*[^\s,;]+/gi, replacement: "[SECRET]" },
  { name: "path", pattern: /(?:[A-Z]:\\|\/Users\/|\/home\/)[^\s"']+/g, replacement: "[PATH]" },
];

export function redactFeedback(input) {
  let safeText = String(input ?? "").slice(0, 2000);
  const redactions = [];
  for (const rule of RULES) {
    if (rule.pattern.test(safeText)) redactions.push(rule.name);
    rule.pattern.lastIndex = 0;
    safeText = safeText.replace(rule.pattern, rule.replacement);
  }
  return { safeText, redactions, rejected: safeText.trim().length === 0 };
}
