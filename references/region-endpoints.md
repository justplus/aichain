# AIChain Region Endpoints

Use this file only as a local fallback after checking official docs or when official docs are not readable.

## Mapping

| Region selection | Region code | Endpoint |
| --- | --- | --- |
| 中国大陆 | `cn` | `wss://aichain-sh.xfyun.cn` |
| US | `overseas` | `wss://aichain-us.iflyoversea.com` |
| Russia | `rus` | `wss://aichain-rus.iflyoversea.com` |

The WebAPI runner and generated clients should treat these as base hosts and compose `/v1/chat/<appId>` plus signing query parameters.

Ask the developer for an endpoint only when the chosen region is not listed here and not present in the official documentation.
