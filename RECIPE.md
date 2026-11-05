# Session titles

Every coding agent's session, where you look for it. The Agents list names each
row after the conversation the agent is on, beside its tab (`auth - Fix login
redirect`), and each pane header shows it after the program (`Pi · Fix login
redirect`), and the tab bar labels an agent's tab with it, so two agents in
one tab or one space are told apart at a glance.
It reads the title each agent already gives its terminal: run with Pi, Claude
Code and Codex; OpenCode's and Gemini CLI's formats are taken from their source.

![Session titles](preview.png)

## What you see

Three mods, each a small change to a shipped one; everything else looks and
behaves exactly like the shipped mod it replaces.

- **Agents list** (`session-titles-agents`, from the shipped `agents`). Each
  row keeps its icon, age and status mark. Its text, call it the detail, becomes:
  - `<tab name> - <session>` when the tab has a name someone gave it
    (`tab.named`), other than the program's name or the session itself;
  - `<session>` when the tab is unnamed (its number), named after the agent's
    own program (`Pi`, `Claude Code`), or the same as the session;
  - what the shipped list showed, when the agent reports no session.
  In Priority view and for pinned rows, the detail follows the space name
  (`api-server · billing - Refactor billing service`, the detail in `dim`); in
  Grouped view the space is the section header and the row shows the detail
  alone, in `foreground` (`muted` when idle). Long text truncates with `…`.
- **Pane header** (`session-titles-pane`, from the shipped `pane`). After the
  program's name (`font_medium`, `foreground`, at most 260px) come a `dim` `·`
  and the session in `foreground` at regular weight, at most 320px, then the
  folder in `dim` taking the rest. With no session it is the shipped header:
  name, then folder. A home folder shows as `~` on Windows too (`C:\Users\x\repo`
  → `~\repo`), whatever the case of the drive and letters and with `\` or `/`;
  on macOS and Linux exactly as before (case-sensitive, `/` only).
- **Tab bar** (`session-titles-tabs`, from the shipped `tabs`). A tab's label
  is the session of the first agent pane in it that has one; otherwise the
  shipped label: the tab's stored name, or for a tab Herdr never named (`tb<n>`)
  the program's name (`Terminal` when there is none). A zoomed tab still gets
  ` Z`. Icon, pill, status spinner or dot, and buttons are the shipped bar's.

## How it behaves

- Agent statuses look as in the shipped mods: in the list, the Needs you /
  Working / Done / Idle sections and marks (in Priority view a compact `!` for
  blocked, a spinner for working, a dot for done, a ring for idle; Grouped view
  the shipped pill); in the header, the spinner, the `Needs you` pill and the
  done dot. Status never changes the wording.
- Titles are live: when an agent renames its session (Pi's `/name`, Claude
  Code's `/rename`, Codex's `/rename`), the row, header and tab follow on
  Herdr's next render; nothing polls.
- Clicks, hover buttons, pinning, sorting and keys are the shipped mods'.
- The session comes only from the terminal title (`agents()[i].title`,
  `panes()[i].title`), never from transcripts. First, control characters become
  spaces and spaces collapse. The harness is the agent's `app`, else its
  `program.key` (`pi`/`omp`, `claude`/`claude-code`, `codex`, `opencode`,
  `gemini`/`gemini-cli`), else the title's shape: Gemini when it starts with
  `Gemini CLI (` or with `◇`, `✋`, `⏲` or `✦` and two spaces (looked at before
  spaces collapse), Pi with `π - `, OpenCode with `OC | `, Codex with `[ ! ]
  Action Required` or `[ . ] Action Required`:
  - **Pi** `π - <session> - <folder>`: split on `" - "`; with three parts or
    more the session is everything between the first and the last. `π - repo`
    has none.
  - **Codex** `<spinner> <thread> | <project>`, or `[ ! ] Action Required |
    <thread> | <project>` (also `[ . ]`): drop that prefix, then leading
    braille spinner frames; split on `" | "`. Exactly two parts: the session is
    the first. One part (a thread without a name leaves only the project) or
    three and more (a custom `/title` item list, which can't be told apart): none.
  - **OpenCode** `OC | <session>`: the part after `OC | `. `OpenCode` (its home
    screen) has none.
  - **Gemini CLI**: never a session; its title is a state and the folder.
  - **Claude Code and anything else**: drop leading braille spinner frames,
    then a run of symbols followed by a space or standing alone (`✳ `, `●`), but
    keep leading punctuation that belongs to the text (`#12 bug`, `(draft) plan`). No session
    if what's left is empty, a path or prompt (starts with `~`, `/`, `\`, a drive
    `C:\` or `C:/`, or `user@host:`), a passing state (`working`, `thinking`,
    `loading`, `connecting`, `idle`, `done`, `ready`, `busy`, `waiting`,
    optionally followed by `.`, `…`, `!`), or the program's name or key, the
    `app`, or `Claude Code` (case-insensitive).
- A session that is all digits still counts as a session, not as an automatic
  tab number.
- The header and the tab bar show a session only for agent panes
  (`program.agent` or `app`).
- The tab bar draws the session as the label; it never writes the tab's stored
  name (`tab.rename`). A name someone gives a tab shows only while no agent in
  it has a session.

## Built from

- `mods/session-titles-agents/`: `mod.clone {name: "agents", as:
  "session-titles-agents"}`, then a comment at the top saying it was modified,
  `import { session, rowDetail } from "./session.js"`, and in `render`:
  - the `label(a)` helper (the one returning `title(tab, lead(tab))`) returns
    `rowDetail({ tabName: tab?.name, tabNamed: tab?.named, programName:
    a.program?.name, session: session(a), fallback })`, where `fallback` is
    what it returned before; it records in a `told` set each agent whose label
    came from a session, and keeps each result in a `Map` for the render (rows
    ask several times);
  - the two places that treat an all-digit label as an automatic tab number
    (building `detail`, and the row's `name`) skip agents in `told`.
  - The sort menu opens the mod itself: `openOverlay({ mod:
    "session-titles-agents", ... })`. `mod.clone` rewrites the shipped name;
    check it again after renaming a clone.
- `mods/session-titles-pane/`: `mod.clone {name: "pane", as:
  "session-titles-pane"}` (its icons come along), then a modified-file comment,
  `import { session } from "./session.js"`, `const s = p.program?.agent ||
  p.app ? session(p) : ""` in `render`, and between the name and the folder:
  `.when(Boolean(s), el => el.child(div().flex_none().text_color(t.dim).child("·")).child(div().min_w(0).max_w(320).flex_shrink_1().truncate().text_color(t.foreground).child(s)))`;
  the folder gets `.min_w(0)`. `folder(cwd)` becomes `shortFolder(cwd, home(),
  window()?.platform === "windows")` from `session.js`.
- `mods/session-titles-tabs/`: `mod.clone {name: "tabs", as:
  "session-titles-tabs"}` (its `win-*` icons come along), then a modified-file
  comment, `import { session } from "./session.js"`, and in the per-tab `item`:
  `const mine = panes().filter(p => p.tab === c.id)`, the program from `mine`
  as before, `const live = mine.filter(p => p.program?.agent ||
  p.app).map(session).find(Boolean)`, and `const name = live || <the shipped
  name>`.
- `session.js`: `export function session(t)` with the rules above, and `export
  function rowDetail({ tabName, tabNamed, programName, session, fallback })`
  (when `tabNamed` is missing, as in older Herdr, a tab name of all digits counts
  as unnamed), and `export function shortFolder(cwd, home, windows)`. The same
  file sits in every mod's folder, so each mod stands alone.
- Layout: a copy of the person's layout (`layout.clone`) with the block whose
  `content.mod` is `agents` set to `session-titles-agents`, and
  `pane.header.content.mod` set to `session-titles-pane` (or a header added:
  `{ "content": { "mod": "session-titles-pane" }, "height": 30, "position":
  "top", "reveal": "always" }`), and the block with `"id": "tabs"` given
  `"content": { "mod": "session-titles-tabs" }`.
- No keys, no programs, no network. `herdr` calls are the shipped mods' own.
  Icons come from `mods/workspace-chrome/` (Herdr's shipped mod) and the pane's
  own folder.
- `tests/session.test.mjs` (`npm test`): the title rules per harness, row
  naming, and every `session.js` copy being identical.

## Watch out

- Every mod has `"place": "none"`: copying them changes nothing on screen
  until a layout names them. Installing means the layout step too.
- Build from the person's own Herdr version: clone their shipped `agents`,
  `pane` and `tabs` and apply the change, rather than copying this repo's
  `main.js` files (clones of Herdr 0.1.11, and 0.1.13 for `tabs`) onto a
  different Herdr.
- The tab bar takes the close icon from `mods/pane/` and the spinner from
  `mods/workspace-chrome/`, as the shipped bar does.
- Herdr sets a tab's stored name once, when the tab is made (the terminal's
  name or its program's name), and doesn't follow the title. Don't fix that by
  calling `tab.rename` from the mod: drawing the session is enough.
- Claude Code titles its terminal `Claude Code` until the conversation has a
  title; that reads as no session, so a new tab shows its stored name until then.
- `flex_shrink()` takes a number in gpui-kit; use `flex_shrink_1()`.
- Use `tab.named`, not the tab name's shape, to tell a named tab: a person may
  name a tab `2025`.
- A renamed or deleted mod folder that a layout still names shows as an error
  in `herdr-app status` until the layout points elsewhere.
- Harness title formats are theirs to change, and Codex's is configurable
  (`/title`). A title that stops parsing falls back to the shipped detail: the
  Pi, Codex, OpenCode and Gemini rules return nothing unless the shape matches.
- OpenCode's plugin pages are titled `OC | <plugin>`, which reads as a session;
  the title alone can't tell them apart. A Pi folder whose name contains ` - `
  makes an unnamed Pi session read as part of it.
- The Gemini titles are padded with spaces to 80 characters, and Herdr may know
  Gemini (and OpenCode) only as `node`: recognise them by the title's shape too.
- Run on Windows with Herdr 0.1.11, Pi, Claude Code and Codex; the tab bar on
  macOS with Herdr 0.1.13 and Claude Code. OpenCode and
  Gemini CLI formats come from their source; macOS and Linux are untested
  (nothing in the code is platform-specific).

## Done when

- `herdr-app check` passes for every mod and `herdr-app status` shows
  `errors: []` with the layout using them; `npm test` passes.
- A Pi agent in a tab named `auth` on the session `Fix login redirect` reads
  `auth - Fix login redirect` in the Agents list and `Pi · Fix login redirect`
  in its pane header.
- Codex renamed with `/rename Refactor billing` in a tab named `billing` reads
  `billing - Refactor billing`; before the rename its row is the shipped one.
- An OpenCode session titled `Write v2 migration guide` in an unnamed tab reads
  just `Write v2 migration guide`.
- A Gemini CLI agent's row and header look like the shipped ones.
- Renaming the session in the agent updates both places without reopening anything.
- An agent at a shell prompt or still starting (title is a path or the
  program's name) shows what the shipped list shows.
- The Agents list's sort button still opens its menu.
- A Claude Code tab whose stored name is `Claude Code` reads `Fix login
  redirect` after `/rename Fix login redirect`, while `herdr-app ls` still
  shows the stored name; a tab running only a shell shows its stored name.
- Double-click, drag-to-move, close, scrolling, `+` and the panel buttons work
  as in the shipped tab bar.
