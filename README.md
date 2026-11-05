# Session titles for Herdr

See which conversation each coding agent is on. The Agents list names every row
after the agent's session, next to its tab (`auth - Fix login redirect`), and
pane headers show it after the program (`Pi · Fix login redirect`), and the
tab bar labels an agent's tab with it (`Fix login redirect`). It reads
the title each agent already gives its terminal, so there is nothing to set up
in the agents.

![Session titles in Herdr](preview.png)

Three mods for the [Herdr](https://herdr.dev) desktop app:

| Mod | Replaces | Shows |
|---|---|---|
| `session-titles-agents` | the shipped `agents` list | `<tab> - <session>` on each agent's row |
| `session-titles-pane` | the shipped `pane` header | `<program> · <session>`, then the folder |
| `session-titles-tabs` | the shipped `tabs` bar | `<session>` as the label of a tab holding an agent |

## Supported agents

| Agent | Its terminal title | Session shown |
|---|---|---|
| Pi | `π - <session> - <folder>` | the middle part, once the session has a name |
| Claude Code | `✳ <conversation title>` | the title |
| Codex | `⠋ <thread> \| <project>` | the thread name, once the thread has one (`/rename`) |
| OpenCode | `OC \| <session>` | the session title |
| Gemini CLI | its state and folder (`◇  Ready (repo)`) | none: Gemini doesn't title its terminal with a session |
| any other | its title | the title, unless it's a path, a prompt, the program's name or a state like `Working…` |

With no session, a row or header shows what Herdr's own list and header show.
The agent is recognised by what it reports to Herdr, else by Herdr's program
table, else by its title's shape, so a Gemini or OpenCode title is read right
even when Herdr only sees `node`.

Pi, Claude Code and Codex were checked running; OpenCode and Gemini CLI from
their source. An agent only appears in Herdr's Agents list when it reports its
status to Herdr; this mod doesn't change which agents do.

## Install

Ask your Herdr agent: *"add the mod at github.com/choam2426/herdr-session-titles"*.
It reads [RECIPE.md](RECIPE.md) and the files, copies the mod folders and points
a copy of your layout at them.

By hand:

1. Copy the mod folders:

   ```sh
   git clone https://github.com/choam2426/herdr-session-titles
   cp -R herdr-session-titles/mods/* ~/.config/herdr-app/mods/
   ```

   Use `$HERDR_APP_HOME` instead of `~/.config/herdr-app` if you set it. If a
   folder with one of these names already exists, rename the new one (and
   the names in step 3) rather than copying over it.

2. Copy the layout you use (Herdr's own layouts are read-only). For the
   default one, `main`:

   ```sh
   herdr-app do layout.clone '{"name":"main","as":"main-titles"}'
   ```

3. In `~/.config/herdr-app/layouts/main-titles.json`:
   - the block whose `content.mod` is `agents`: set it to `session-titles-agents`;
   - the pane header's `"mod": "pane"`: set it to `session-titles-pane`. A
     layout without a pane header can add one to its `pane` settings:
     `"header": { "content": { "mod": "session-titles-pane" }, "height": 30, "position": "top", "reveal": "always" }`;
   - the tab bar, the block with `"id": "tabs"`: set its `content` to
     `{ "mod": "session-titles-tabs" }`.

   Each mod is independent: skip any you don't want.

4. Check:

   ```sh
   herdr-app check ~/.config/herdr-app/mods/session-titles-agents
   herdr-app check ~/.config/herdr-app/mods/session-titles-pane
   herdr-app check ~/.config/herdr-app/mods/session-titles-tabs
   herdr-app status     # "errors": []
   ```

To go back: `herdr-app do layout.switch '{"name":"main"}'`. Deleting the layout
copy and the mod folders removes it all.

## Notes

- Nothing is read from transcripts or sent anywhere. The mods run no programs and
  make no network calls. Besides their own icons they use Herdr's from
  `mods/workspace-chrome/`.
- Pins and "since" times in the Agents list start empty: Herdr keeps them per mod,
  so they don't carry over from the shipped list.
- The pane header also shortens a Windows home folder to `~`, which the shipped
  header only does for `/` paths.
- A name you give a tab yourself shows only while no agent in it has a session;
  while one does, the session wins. The tab bar only changes the label it draws,
  never the tab's stored name.

## Limits

- The mods are copies of Herdr 0.1.11's shipped `agents` and `pane` and Herdr
  0.1.13's shipped `tabs`, so later
  changes Herdr makes to its own Agents list and pane header don't reach them.
  [RECIPE.md](RECIPE.md) is written so an agent can redo the change on your version.
- The code has no platform-specific parts; paths are handled for Windows, macOS
  and Linux. The Agents list and pane header were run on Windows, the tab bar on
  macOS; Linux is untested.
- A custom Codex title (`/title`) isn't read: only the default `<thread> |
  <project>` is, and anything else shows what Herdr shows. A title format Pi,
  Codex or OpenCode change in a later version may not be read either.
- OpenCode titles its plugin pages `OC | <plugin>` too; those read as a session.
- Pi puts the folder last: a folder whose name contains ` - ` makes an unnamed Pi
  session read as part of the folder name.

## Development

```sh
npm test    # the title rules per agent, row naming, both session.js copies identical
```

## License

Apache-2.0, see [LICENSE](LICENSE) and [NOTICE](NOTICE). The mods are derived
from Herdr's shipped `agents`, `pane` and `tabs` mods.
