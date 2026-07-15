# iLoveVideoEditor MCP Server — Installation Guide for AI Agents

Everything an AI agent (Cline, Claude, Cursor, or any MCP client) needs to
install and configure the iLoveVideoEditor MCP server.

## Overview

- npm package: `@ilovevideoeditor/mcp-server`
- Official MCP registry id: `com.ilovevideoeditor/mcp-server`
- Transport: stdio
- Runtime: Node.js 18+ (executed via `npx`, no global install)

## Prerequisites

1. An iLoveVideoEditor API key. The user creates one at
   https://ilovevideoeditor.com/dashboard/account/api (free sign-up).
2. Node.js on `PATH` so `npx` is available.

## Install

No installation step is required — the server runs through `npx`. Add it to the
MCP client's settings file (for Cline: `cline_mcp_settings.json`; for Claude
Desktop: `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "ilovevideoeditor": {
      "command": "npx",
      "args": ["-y", "@ilovevideoeditor/mcp-server"],
      "env": {
        "VF_API_KEY": "<the user's iLoveVideoEditor API key>"
      }
    }
  }
}
```

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `VF_API_KEY` | yes | — | iLoveVideoEditor API key (sent as `x-api-key`) |
| `VF_API_BASE_URL` | no | `https://api.ilovevideoeditor.com` | API base URL override |

## Verify

After saving the config, reload the MCP client. Six tools should appear:

- `ilovevideoeditor_list_templates`
- `ilovevideoeditor_get_template`
- `ilovevideoeditor_render_json`
- `ilovevideoeditor_render_template`
- `ilovevideoeditor_get_render_status`
- `ilovevideoeditor_get_download_url`

Smoke test: call `ilovevideoeditor_list_templates` — it should return template
names without an authentication error.

## Typical render flow

1. `ilovevideoeditor_list_templates` — pick a template.
2. `ilovevideoeditor_get_template` — read its variable schema.
3. `ilovevideoeditor_render_template` with variables (or
   `ilovevideoeditor_render_json` with raw VideoJSON) — returns a render job id.
4. Poll `ilovevideoeditor_get_render_status` until the job is `completed`.
5. `ilovevideoeditor_get_download_url` — returns the MP4 download URL.

## Troubleshooting

- `401`/`403`: `VF_API_KEY` missing or invalid — ask the user for a key from the
  dashboard link above.
- `npx` not found: install Node.js 18+.
- Renders are asynchronous: always poll the job status before requesting the
  download URL.
