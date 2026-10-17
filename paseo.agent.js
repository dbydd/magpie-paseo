// Paseo (paseo.sh) keeps its daemon configuration in ~/.paseo/config.json.
// The config's agents.providers block takes profiles that extend a
// first-class provider with env vars and a model list, and Paseo passes
// provider env through to every Claude Code session it launches. A profile
// that extends "claude" is therefore a gateway provider: point
// ANTHROPIC_BASE_URL at magpie (the base without /v1, as Claude Code reads
// it) and list magpie's models, and every session launched with that
// profile runs on magpie.
//
// The model is picked in Paseo, per agent, the way Paseo picks a provider's
// model: this agent is a switch, not a model field. Paseo reads
// agents.providers at launch and on provider refresh, so an edited file
// needs `paseo reload` to show up.
export const agent = {
  id: "paseo",
  name: "Paseo",
  // paseo.sh's own logo, on the Agents page and the plugin's row
  icon: "https://raw.githubusercontent.com/getpaseo/paseo/main/packages/website/public/logo.svg",
  config: "~/.paseo/config.json",
  format: "json",
  dir: "~/.paseo",
  ua: ["paseo"],
  notice:
    "In Paseo, create an agent with the Paseo (Magpie) provider and pick its model there. Run `paseo reload` if the daemon is already running. 在 Paseo 里新建 agent 时选择 Paseo (Magpie) 这个 provider，模型在 Paseo 里选；daemon 已在运行时执行 `paseo reload`。",
}

export function connect({ gateway, models }) {
  const profile = {
    extends: "claude",
    label: "Paseo (Magpie)",
    description: "Claude sessions routed through magpie's local gateway",
    env: {
      ANTHROPIC_BASE_URL: gateway.url,
      ANTHROPIC_AUTH_TOKEN: gateway.key,
    },
  }
  // the profile replaces its base provider's catalog, so Paseo's model
  // picker lists exactly what magpie offers this agent. An empty catalog
  // (no provider signed in yet) leaves the key out rather than emptying
  // Paseo's picker; connect runs again when magpie's models change.
  if (models.length > 0) {
    profile.models = models.map((m) => ({ id: m.id, label: m.name || m.id }))
  }
  return { "agents.providers.paseo-magpie": profile }
}
