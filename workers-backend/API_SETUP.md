# Cloudflare Workers AI REST API Setup Guide

This guide shows you how to use Cloudflare Workers AI models via REST API calls (instead of bindings) for local development.

## 📋 Step-by-Step Setup

### Step 1: Get Your Cloudflare Account ID

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Your **Account ID** is displayed in the right sidebar
3. Copy it - you'll need it in Step 3

### Step 2: Create an API Token

1. Go to [API Tokens page](https://dash.cloudflare.com/profile/api-tokens)
2. Click **"Create Token"**
3. Click **"Edit Cloudflare Workers"** template (or create custom token)
4. Make sure it has these permissions:
   - **Workers AI:Edit** ✅
   - **Workers AI:Read** ✅
5. Click **"Continue to summary"** → **"Create Token"**
6. **Copy the token immediately** (you won't see it again!)
   - If you lose it, you'll need to create a new one

### Step 3: Configure Your Environment

You have **two options** to set the credentials:

#### Option A: Using `wrangler.toml` (Recommended)

1. Open `wrangler.toml`
2. Uncomment and fill in the credentials:

```toml
[vars]
ENVIRONMENT = "development"
CLOUDFLARE_ACCOUNT_ID = "your-actual-account-id-here"
CLOUDFLARE_API_TOKEN = "your-actual-api-token-here"
```

#### Option B: Using Environment Variables

Set them in your shell:

```bash
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
export CLOUDFLARE_API_TOKEN="your-api-token"
```

Or create a `.env` file (make sure to add it to `.gitignore`):

```bash
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
```

### Step 4: Verify Setup

1. Start the backend:
   ```bash
   cd signalflow-backend/workers-backend
   npm run dev
   ```

2. Test the API:
   ```bash
   curl http://localhost:8787/api/feedback
   ```

3. If you see sentiment analysis results → ✅ **Success!**
4. If you see an error about missing credentials → Check Step 3

## 🔍 How It Works

The code now uses **REST API calls** to Cloudflare Workers AI:

- **Endpoint**: `https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/{MODEL_ID}`
- **Authentication**: Bearer token in `Authorization` header
- **Models Used**:
  - `@cf/huggingface/distilbert-sst-2-int8` - Sentiment classification
  - `@cf/meta/llama-3.1-8b-instruct` - Emotion detection

## 🧪 Testing the API Directly

You can test the Cloudflare API directly with curl:

```bash
# Test sentiment classification
curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/ai/run/@cf/huggingface/distilbert-sst-2-int8" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "I love this product!"}'

# Test chat/LLM model
curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/ai/run/@cf/meta/llama-3.1-8b-instruct" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "What is 2+2?"}
    ]
  }'
```

## ⚠️ Troubleshooting

### Error: "Cloudflare AI credentials missing"
- **Solution**: Make sure `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` are set in `wrangler.toml` or environment variables

### Error: "401 Unauthorized"
- **Solution**: Check that your API token is correct and has the right permissions

### Error: "403 Forbidden"
- **Solution**: Your API token might not have `Workers AI:Edit` permission. Create a new token with correct permissions.

### Error: "Model not found"
- **Solution**: Make sure Workers AI is enabled in your Cloudflare account. Some models may require specific account tiers.

### Error: "Account ID invalid"
- **Solution**: Double-check your Account ID from the Cloudflare dashboard

## 🔒 Security Notes

- **Never commit** your API token to git
- Add `wrangler.toml` to `.gitignore` if it contains secrets (or use environment variables)
- Use environment variables in production instead of hardcoding in `wrangler.toml`

## 📚 Additional Resources

- [Cloudflare Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [Workers AI REST API Reference](https://developers.cloudflare.com/workers-ai/get-started/rest-api/)
- [API Tokens Guide](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)

## ✅ Quick Checklist

- [ ] Got Account ID from Cloudflare Dashboard
- [ ] Created API Token with Workers AI permissions
- [ ] Added credentials to `wrangler.toml` or environment variables
- [ ] Started backend server (`npm run dev`)
- [ ] Tested API endpoint (`curl http://localhost:8787/api/feedback`)
- [ ] Saw sentiment analysis results

Once all checked, you're ready to go! 🚀
