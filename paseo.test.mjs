import { expect, test } from "bun:test"
import { agent, connect } from "./paseo.agent.js"

const gateway = { url: "http://127.0.0.1:3425", v1: "http://127.0.0.1:3425/v1", key: "magpie-paseo" }
const models = [
  { id: "deepseek/deepseek-flash", name: "DeepSeek Flash" },
  { id: "group/fast", name: "Fast" },
]

test("says where Paseo keeps its config, and is a switch: the model is picked in Paseo", () => {
  expect(agent).toMatchObject({
    id: "paseo",
    config: "~/.paseo/config.json",
    format: "json",
    dir: "~/.paseo",
  })
  // connect-only: Paseo picks the model per agent among the models connect
  // writes into its provider profile
  expect(agent.model).toBeUndefined()
  expect(agent.prefix).toBeUndefined()
})

test("shows Paseo's own logo, as the package gives it", async () => {
  const pkg = await Bun.file(new URL("./package.json", import.meta.url)).json()
  const logo = "https://raw.githubusercontent.com/getpaseo/paseo/main/packages/website/public/logo.svg"
  expect(agent.icon).toBe(logo)
  expect(pkg.magpie.icon).toBe(agent.icon)
  expect(pkg.magpie.agent).toBe("./paseo.agent.js")
})

test("tells the user where to pick the model, in English and Chinese", () => {
  expect(agent.notice).toContain("paseo reload")
  expect(agent.notice).toContain("模型在 Paseo 里选")
})

test("writes one claude-extending profile at magpie's gateway, carrying magpie's catalog", () => {
  const out = connect({ gateway, models, agent: { id: "paseo", config: "/home/u/.paseo/config.json" } })
  expect(out).toEqual({
    "agents.providers.paseo-magpie": {
      extends: "claude",
      label: "Paseo (Magpie)",
      description: "Claude sessions routed through magpie's local gateway",
      // the Anthropic client takes the base without /v1
      env: {
        ANTHROPIC_BASE_URL: "http://127.0.0.1:3425",
        ANTHROPIC_AUTH_TOKEN: "magpie-paseo",
      },
      models: [
        { id: "deepseek/deepseek-flash", label: "DeepSeek Flash" },
        { id: "group/fast", label: "Fast" },
      ],
    },
  })
})

test("a model magpie names no better still gets a label Paseo accepts", () => {
  const out = connect({
    gateway,
    models: [{ id: "deepseek/deepseek-flash", name: "" }],
    agent: {},
  })
  expect(out["agents.providers.paseo-magpie"].models).toEqual([
    { id: "deepseek/deepseek-flash", label: "deepseek/deepseek-flash" },
  ])
})

test("an empty catalog leaves Paseo's own model list alone", () => {
  const out = connect({ gateway, models: [], agent: {} })
  expect("models" in out["agents.providers.paseo-magpie"]).toBe(false)
})

test("the profile satisfies Paseo's own provider-config schema", () => {
  // ProviderOverrideSchema (getpaseo/paseo, packages/protocol/src/provider-config.ts):
  // id lowercase with hyphens; extends a builtin; a custom provider needs a
  // label; env is a string record; models require id and label, both min 1
  const entry = connect({ gateway, models, agent: {} })["agents.providers.paseo-magpie"]
  expect(/^[a-z][a-z0-9-]*$/.test("paseo-magpie")).toBe(true)
  expect(entry.extends).toBe("claude")
  expect(entry.label.length).toBeGreaterThan(0)
  expect(Object.values(entry.env).every((v) => typeof v === "string")).toBe(true)
  expect(entry.models.every((m) => m.id.length > 0 && m.label.length > 0)).toBe(true)
})
