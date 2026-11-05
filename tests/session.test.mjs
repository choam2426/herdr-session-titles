// node tests/session.test.mjs: the title rules per harness, how a row is named,
// and every mod carrying the same session.js.
import { readFileSync } from "node:fs";
import { session, rowDetail, shortFolder } from "../mods/session-titles-agents/session.js";

let bad = 0, count = 0;
const check = (what, got, want) => {
  count++;
  if (got !== want) { bad++; console.log(`FAIL ${what}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); }
};

const copy = (m) => readFileSync(new URL(`../mods/${m}/session.js`, import.meta.url), "utf8");
check("session.js copies match", copy("session-titles-agents") === copy("session-titles-pane"), true);
check("session.js copies match (tabs)", copy("session-titles-agents") === copy("session-titles-tabs"), true);

const P = {
  pi: { app: "pi", program: { name: "Pi", key: "pi" } },
  claude: { app: "claude-code", program: { name: "Claude Code", key: "claude" } },
  codex: { app: "codex", program: { name: "Codex", key: "codex" } },
  opencode: { app: "opencode", program: { name: "OpenCode", key: "opencode" } },
  gemini: { app: "gemini", program: { name: "Gemini", key: "gemini" } },
  other: { app: "copilot", program: { name: "Copilot", key: "copilot" } },
};
const cases = [
  // Pi: "π - <session> - <folder>"
  ["pi", "π - Fix login redirect - webapp", "Fix login redirect"],
  ["pi", "π - Fix CI - api-server", "Fix CI"],
  ["pi", "π - fix a - b - herdr-app", "fix a - b"],
  ["pi", "π - #12 bug - repo", "#12 bug"],
  ["pi", "π - Réparer la connexion - webapp", "Réparer la connexion"],
  ["pi", "π - webapp", ""],
  // Codex: "<spinner> <thread> | <project>"
  ["codex", "webapp", ""],
  ["codex", "⠋ Fix login redirect | webapp", "Fix login redirect"],
  ["codex", "Fix login redirect | webapp", "Fix login redirect"],
  ["codex", "[ ! ] Action Required | Fix login redirect | webapp", "Fix login redirect"],
  ["codex", "[ . ] Action Required | webapp", ""],
  ["codex", "[ ! ] Action Required", ""],
  ["codex", "# Fix flaky test | webapp", "# Fix flaky test"],
  // A custom Codex title (/title) reads as none rather than the wrong part.
  ["codex", "webapp | Fix login | main", ""],
  ["codex", "[ ! ] Action Required | Fix | webapp | main", ""],
  // Claude Code: "<mark> <title>"
  ["claude", "✳ Add OAuth callback tests", "Add OAuth callback tests"],
  ["claude", "⠐ Add OAuth callback tests", "Add OAuth callback tests"],
  ["claude", "Write v2 migration guide", "Write v2 migration guide"],
  ["claude", "Claude Code", ""],
  ["claude", "✳ Claude Code", ""],
  ["claude", "#12 flaky test", "#12 flaky test"],
  ["claude", "(draft) release plan", "(draft) release plan"],
  ["claude", "42", "42"],
  ["claude", "✳", ""],
  ["claude", "✳ ", ""],
  // OpenCode: "OC | <session>"
  ["opencode", "OC | Refactor billing", "Refactor billing"],
  ["opencode", "OpenCode", ""],
  // Gemini CLI: state and folder only
  ["gemini", "◇  Ready (webapp)", ""],
  ["gemini", "✋  Action Required (webapp)", ""],
  ["gemini", "Gemini CLI (webapp)", ""],
  ["gemini", "✦  Planning the refactor (webapp)", ""],
  // Unknown harnesses: the title, unless it's a path, a prompt, its name or a state
  ["other", "Review the payments PR", "Review the payments PR"],
  ["other", "Copilot", ""],
  ["other", "Working…", ""],
  ["other", "⠋ Working", ""],
  ["other", "✳ ~/x", ""],
  ["other", "C:\\Users\\dev", ""],
  ["other", "c:/work", ""],
  ["other", "/home/dev/repo", ""],
  ["other", "dev@host:~/repo", ""],
  ["other", "Reply to bob@example.com: refund", "Reply to bob@example.com: refund"],
  ["other", "a\x07b\x1bc", "a b c"],
  ["other", "", ""],
  // A harness's own format wins over a look-alike title.
  ["claude", "π - a - b", "π - a - b"],
];
for (const [h, title, want] of cases) check(`${h} ${JSON.stringify(title)}`, session({ ...P[h], title }), want);
check("no app, π title", session({ title: "π - Fix CI - api", app: null }), "Fix CI");
// An agent Herdr knows by neither app nor program key: told by the title's shape.
const unknown = { app: null, program: { name: "node", key: "node" } };
const pad = (s) => s.padEnd(80, " ");
for (const [title, want] of [
  [pad("Gemini CLI (webapp)"), ""],
  [pad("◇  Ready (webapp)"), ""],
  [pad("✋  Action Required (webapp)"), ""],
  [pad("⏲  Working… (webapp)"), ""],
  [pad("✦  Planning the refactor (webapp)"), ""],
  ["OC | Refactor billing", "Refactor billing"],
  ["[ ! ] Action Required | Fix login | webapp", "Fix login"],
]) check(`no app ${JSON.stringify(title.trim())}`, session({ ...unknown, title }), want);
check("undefined input", session(undefined), "");
const long = "x".repeat(500);
check("long title", session({ ...P.claude, title: long }), long);

// rowDetail: "<tab> - <session>" for a tab someone named.
const row = (o) => rowDetail({ programName: "Pi", fallback: "fallback", ...o });
check("named tab", row({ tabName: "auth", tabNamed: true, session: "Fix login" }), "auth - Fix login");
check("unnamed tab", row({ tabName: "1", tabNamed: false, session: "Fix login" }), "Fix login");
check("tab named like digits", row({ tabName: "2025", tabNamed: true, session: "Fix login" }), "2025 - Fix login");
check("tab named after the program", row({ tabName: "Pi", tabNamed: true, session: "Fix login" }), "Fix login");
check("tab named like the session", row({ tabName: "Fix login", tabNamed: true, session: "Fix login" }), "Fix login");
check("no session", row({ tabName: "auth", tabNamed: true, session: "" }), "fallback");
check("older Herdr without named", row({ tabName: "auth", session: "Fix login" }), "auth - Fix login");
check("older Herdr, number tab", row({ tabName: "3", session: "Fix login" }), "Fix login");

// shortFolder: the home folder as "~".
check("posix home", shortFolder("/home/dev", "/home/dev"), "~");
check("posix inside", shortFolder("/home/dev/repo", "/home/dev"), "~/repo");
check("posix sibling", shortFolder("/home/dev2/repo", "/home/dev"), "/home/dev2/repo");
check("posix is case-sensitive", shortFolder("/Home/dev/repo", "/home/dev"), "/Home/dev/repo");
check("posix ignores backslash", shortFolder("/home/dev\\repo", "/home/dev"), "/home/dev\\repo");
check("macOS inside", shortFolder("/Users/dev/repo", "/Users/dev"), "~/repo");
check("windows inside", shortFolder("C:\\Users\\dev\\repo", "C:\\Users\\dev", true), "~\\repo");
check("windows case and slashes", shortFolder("c:/users/dev/repo", "C:\\Users\\dev", true), "~/repo");
check("windows home", shortFolder("c:\\users\\dev", "C:\\Users\\dev", true), "~");
check("windows sibling", shortFolder("C:\\Users\\dev2", "C:\\Users\\dev", true), "C:\\Users\\dev2");
check("no cwd", shortFolder(null, "/home/dev"), "");

console.log(bad ? `${bad} of ${count} failed` : `all ${count} passed`);
process.exit(bad ? 1 : 0);
