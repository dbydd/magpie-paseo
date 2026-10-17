# Paseo agent

Run [Paseo](https://paseo.sh)'s Claude sessions on a model picked in Magpie. Paseo is an open-source agentic development environment: it orchestrates Claude Code, Codex, Copilot, OpenCode, Pi and more, on your machines, from desktop and mobile.

```sh
magpie plugin add @dbydd/agent-paseo
```

On Magpie's Agents page select **Paseo** and switch it on. The plugin writes a `paseo-magpie` profile into `~/.paseo/config.json` under `agents.providers`: a profile extending Paseo's first-class `claude` provider, with magpie's gateway as its `ANTHROPIC_BASE_URL`, the agent's own key, and magpie's model catalog as its model list.

Then, in Paseo, create an agent with the **Paseo (Magpie)** provider and pick a model there. Paseo's model picker shows exactly the models magpie offers this agent, and every Claude Code session launched with that provider goes through magpie and counts under `paseo` in magpie's Usage.

Paseo reads `agents.providers` at launch and on provider refresh: after connecting, pick the provider in Paseo (a new agent sees it without a restart); after a change, `paseo reload` (or a daemon restart) applies it. Disconnecting Paseo in Magpie removes only the keys the plugin wrote — the rest of your `config.json`, and any other providers and profiles, stay as they were.

## Notes

- The profile replaces its base provider's model catalog, so the picker in Paseo lists magpie's models rather than Claude Code's first-party list. Add a model to magpie and it appears in Paseo after `paseo reload`.
- The gateway is an Anthropic-compatible endpoint (`ANTHROPIC_BASE_URL`), the same mechanism magpie's own Claude Code agent uses, so streaming, tool calls and reasoning pass through as Claude Code sends them.
- Only sessions on the **Paseo (Magpie)** provider route through magpie. The built-in `claude` provider and Paseo's Codex, Copilot, OpenCode, Pi and other providers keep their own credentials and are untouched.
- Paseo still needs a Claude Code CLI installed (`claude` on PATH); the profile only decides where it talks, and which models it is offered.

## Verified with

magpie 0.1.1278: the plugin loads, connecting writes the profile beside an existing provider and keeps the rest of `config.json`, and disconnecting restores the file. Paseo 0.10.3: a daemon started on the written config lists `paseo-magpie` as enabled, and with a `claude` binary on its PATH the provider reports Ready with the profile's model list exactly as written (both models, low/medium/high/max thinking). A Claude session through it was not run — no real `claude` CLI or gateway round trip was exercised on the test machine. The schema is Paseo's `docs/custom-providers.md` and `ProviderOverrideSchema` in `packages/protocol/src/provider-config.ts`.
