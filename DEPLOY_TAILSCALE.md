# Deploy Mindrop on spark as a tailnet subdomain

Publishes the Mindrop stack on your tailnet as
**`https://mindrop.<your-tailnet>.ts.net`**, served from spark, private to the
tailnet, with automatic HTTPS. No ports are exposed to the LAN or the public
internet. (Modeled on the Saga / braint-video Tailscale deploy.)

## How it works

```
browser (any tailnet device)
   │  https://mindrop.<tailnet>.ts.net
   ▼
mindrop-tailscale  (Tailscale Serve, :443, auto TLS)   ← its own MagicDNS node "mindrop"
   │  http://web:46720
   ▼
mindrop-tracker-web  (nginx, single-origin gateway)
   ├── /        → SPA (static build)
   └── /api/    → mindrop-tracker-api:46721   (status/assignee override store)
```

`mindrop.<tailnet>.ts.net` is a **new Tailscale node** (the sidecar), not a
sub-name of the `spark` host — MagicDNS names are per-node, so a dedicated node
named `mindrop` is what gives you the subdomain.

Mindrop is **single-origin**: the SPA calls `/api` on its own origin and nginx
proxies that to the tracker API. So — unlike Saga — there is **no public API URL
to bake into the build**, and no app secret to set. The only required input is a
Tailscale auth key.

## One-time setup (Tailscale admin console)

1. **DNS → MagicDNS**: enabled.
2. **DNS → HTTPS Certificates**: enabled (required for Serve to get a TLS cert).
3. **Settings → Keys → Generate auth key**: reusable. If you use ACL tags, tag
   it (e.g. `tag:mindrop`) and add a `tagOwners` entry for it.

Your tailnet domain is shown on the DNS page (e.g. `tailXXXXXX.ts.net` or your
custom `name.ts.net`). The app URL is `mindrop.` + that domain.

## Deploy (run on spark)

Get the repo onto spark (git clone / pull), then from the repo root:

```bash
export TS_AUTHKEY=tskey-auth-xxxxxxxxxxxx

docker compose \
  -f docker-compose.yml \
  -f docker-compose.tailscale.yml \
  --profile production up -d --build
```

First boot: the `mindrop` node joins the tailnet in a few seconds; the TLS cert
is issued on the first HTTPS request. Then open
**`https://mindrop.<your-tailnet>.ts.net`** from any device on the tailnet.

> The tracker API persists overrides to the `mindrop_tracker_data` Docker volume
> — keep it across redeploys and back it up if the data matters.

## Local run (no Tailscale)

The base compose has no profiles, so a plain `up` runs just the app on its
local ports — the Tailscale sidecar only starts under `--profile production`:

```bash
docker compose up -d --build      # → http://localhost:46720
```

## Notes

- **Public access**: this uses Tailscale *Serve* (tailnet-only). Swap to
  *Funnel* only if you deliberately want it on the public internet.
- **Userspace mode**: the sidecar runs `TS_USERSPACE=true`, so it needs no
  `NET_ADMIN`/tun and coexists with spark's host `tailscaled`.
- **Updating**: `git pull` on spark, then re-run the `up -d --build` command.

## Troubleshooting

- `docker logs mindrop-tailscale` — auth / cert / serve status.
- `docker exec mindrop-tailscale tailscale status` — confirm the node is up.
- 502 from the subdomain → the `web`/`api` containers aren't healthy yet
  (`docker compose ... ps`); nginx proxies to `api:46721`, which must be running.
