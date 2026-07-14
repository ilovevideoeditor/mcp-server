# iLoveVideoEditor MCP Server

Model Context Protocol (MCP) server that lets AI agents (Claude, ChatGPT, Cursor,
and any MCP client) render videos with [iLoveVideoEditor](https://ilovevideoeditor.com):
list motion-design templates, fill in variables, submit JSON-to-MP4 render jobs,
poll status, and get download URLs.

## Quick start

Get an API key from the dashboard:
[ilovevideoeditor.com/dashboard/account/api](https://ilovevideoeditor.com/dashboard/account/api)

Add the server to your MCP client config:

```json
{
  "mcpServers": {
    "ilovevideoeditor": {
      "command": "npx",
      "args": ["-y", "@ilovevideoeditor/mcp-server"],
      "env": {
        "VF_API_KEY": "vf_live_xxx"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `ilovevideoeditor_list_templates` | List available templates |
| `ilovevideoeditor_get_template` | Get template details and variable schema |
| `ilovevideoeditor_render_json` | Submit raw `VideoJSON` for rendering |
| `ilovevideoeditor_render_template` | Render from a named template + variables |
| `ilovevideoeditor_get_render_status` | Poll render job status |
| `ilovevideoeditor_get_download_url` | Get signed download URL |

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `VF_API_KEY` | — | **Required.** Your iLoveVideoEditor API key (`x-api-key`) |
| `VF_API_BASE_URL` | `https://api.ilovevideoeditor.com` | API base URL override |

## Development

```bash
npm install
npm run build    # tsc -> dist/
npm start        # stdio transport
npm run dev      # tsx watch
```

The server speaks MCP over stdio (diagnostics go to stderr). An optional
`--http` flag enables HTTP/SSE transport for debugging.

Source of truth lives in the iLoveVideoEditor monorepo (`integrations/mcp-server`);
this repository is the public mirror used for releases.

## License

Apache-2.0
