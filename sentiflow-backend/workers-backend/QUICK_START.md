# Quick Start: Using Cloudflare Workers AI via REST API

## 🚀 3-Step Setup

### 1. Get Your Credentials

**Account ID:**
- Go to https://dash.cloudflare.com
- Copy your Account ID from the right sidebar

**API Token:**
- Go to https://dash.cloudflare.com/profile/api-tokens
- Click "Create Token" → "Edit Cloudflare Workers" template
- Copy the token (you won't see it again!)

### 2. Add to `wrangler.toml`

Open `wrangler.toml` and uncomment these lines:

```toml
[vars]
ENVIRONMENT = "development"
CLOUDFLARE_ACCOUNT_ID = "paste-your-account-id-here"
CLOUDFLARE_API_TOKEN = "paste-your-api-token-here"
```

### 3. Start the Server

```bash
npm run dev
```

Test it:
```bash
curl http://localhost:8787/api/feedback
```

If you see JSON with sentiment analysis → **You're done!** ✅

---

**Need more help?** See `API_SETUP.md` for detailed instructions.
