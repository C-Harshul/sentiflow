# Cloudflare Workers AI Setup Guide

## ✅ Current Status

**Yes, Cloudflare Workers AI IS being used** in this project. The code uses:

1. **Direct Binding** (`env.AI.run()`) - For sentiment classification with `@cf/huggingface/distilbert-sst-2-int8`
2. **Workers AI Binding** - For emotion detection with `@cf/meta/llama-3.1-8b-instruct`

## 🔧 What You Need

### Option 1: Local Development (Recommended for Testing)

**For `wrangler dev` (local development):**

1. **Login to Cloudflare:**
   ```bash
   npx wrangler login
   ```

2. **That's it!** The AI binding in `wrangler.toml` will work automatically:
   ```toml
   [ai]
   binding = "AI"
   ```

   The binding is automatically available via `env.AI` when you run `wrangler dev`.

### Option 2: Using API Credentials (For Production or Remote Access)

If you need to use explicit credentials (e.g., for REST API access or LangChain wrapper):

1. **Get your Cloudflare Account ID:**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Your Account ID is in the right sidebar

2. **Create an API Token:**
   - Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Click "Create Token"
   - Use "Edit Cloudflare Workers" template OR create custom token with:
     - **Permissions:** `Workers AI:Edit` and `Workers AI:Read`
   - Copy the token (you won't see it again!)

3. **Add to `wrangler.toml`:**
   ```toml
   [vars]
   CLOUDFLARE_ACCOUNT_ID = "your-account-id-here"
   CLOUDFLARE_API_TOKEN = "your-api-token-here"
   ```

   **OR** set as environment variables:
   ```bash
   export CLOUDFLARE_ACCOUNT_ID="your-account-id"
   export CLOUDFLARE_API_TOKEN="your-api-token"
   ```

## 🧪 Testing if It Works

1. **Start the backend:**
   ```bash
   npm run dev
   ```

2. **Test the API:**
   ```bash
   curl http://localhost:8787/api/feedback
   ```

3. **Check for errors:**
   - If you see sentiment analysis results → ✅ Working!
   - If you see errors about AI binding → Need to login or add credentials

## 📋 Models Being Used

- **`@cf/huggingface/distilbert-sst-2-int8`** - Sentiment classification (positive/negative/neutral)
- **`@cf/meta/llama-3.1-8b-instruct`** - Emotion detection (frustrated, excited, confused, angry, happy, neutral)

## 🔍 How the Code Works

The code automatically detects if credentials are available:

- **If credentials exist:** Uses LangChain's `ChatCloudflareWorkersAI` wrapper
- **If no credentials:** Uses the Workers AI binding directly (`env.AI.run()`)

Both methods work, but the binding method is simpler for local development.

## ⚠️ Common Issues

1. **"AI binding not found"**
   - Make sure you're logged in: `npx wrangler login`
   - Check `wrangler.toml` has `[ai]` binding configured

2. **"Model not available"**
   - Make sure Workers AI is enabled in your Cloudflare account
   - Some models may require specific account tiers

3. **"Authentication failed"**
   - Check your API token has correct permissions
   - Verify Account ID is correct

## 🚀 Next Steps

1. Run `npx wrangler login` to authenticate
2. Start the dev server: `npm run dev`
3. Test the `/api/feedback` endpoint
4. If everything works, you're all set! 🎉
