# Deploy to Vercel

This guide walks you through deploying the IELTS Writing Training & Exam Simulation app to Vercel.

## Prerequisites

1. A [Vercel](https://vercel.com) account (free tier available)
2. An [OpenRouter](https://openrouter.ai) API key (free tier available)
3. Your repository hosted on GitHub, GitLab, or Bitbucket

## Step 1: Get OpenRouter API Key

1. Sign up at [https://openrouter.ai](https://openrouter.ai)
2. Navigate to [https://openrouter.ai/keys](https://openrouter.ai/keys)
3. Create a new API key
4. Copy the API key (you'll need it in Step 3)

## Step 2: Import Project to Vercel

### Option A: One-Click Deploy

Click the button below to deploy directly:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/YOUR_REPO)

### Option B: Manual Import

1. Log in to [Vercel](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will automatically detect Next.js

## Step 3: Configure Environment Variables

In the Vercel project settings, add these environment variables:

### Required

| Name | Value | Description |
|------|-------|-------------|
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | Your OpenRouter API key |

### Optional

| Name | Value | Description |
|------|-------|-------------|
| `OPENROUTER_MODEL` | `meta-llama/llama-3.1-8b-instruct:free` | AI model to use (defaults to free Llama 3.1) |
| `LANGUAGETOOL_URL` | `http://your-server:8010` | LanguageTool server URL (if self-hosting) |

### Setting Environment Variables

1. Go to your project dashboard on Vercel
2. Navigate to "Settings" → "Environment Variables"
3. Add each variable:
   - Enter the name (e.g., `OPENROUTER_API_KEY`)
   - Enter the value
   - Select environments (Production, Preview, Development)
   - Click "Save"

## Step 4: Deploy

1. Click "Deploy"
2. Vercel will build and deploy your application
3. Wait for the deployment to complete (usually 1-2 minutes)
4. Your app will be live at `https://your-project.vercel.app`

## Step 5: Test Your Deployment

1. Visit your deployed URL
2. Try generating an IELTS question with AI
3. Test the writing assistant features
4. Verify everything works as expected

## Recommended Settings

### Build & Development Settings

Vercel automatically configures these, but you can verify:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### Performance Optimizations

Vercel automatically provides:
- ✅ Edge Network CDN
- ✅ Automatic HTTPS
- ✅ Serverless Functions
- ✅ Image Optimization
- ✅ Zero Configuration

## Domain Configuration (Optional)

### Add a Custom Domain

1. Go to "Settings" → "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (usually 24-48 hours)

## Troubleshooting

### Build Fails

**Problem**: Build process fails during deployment

**Solution**:
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Test build locally: `npm run build`

### AI Features Not Working

**Problem**: AI-powered features return errors

**Solution**:
1. Verify `OPENROUTER_API_KEY` is set correctly
2. Check OpenRouter account has credits/quota
3. Try the free model: `meta-llama/llama-3.1-8b-instruct:free`
4. Check OpenRouter status: https://status.openrouter.ai

### 503 Service Unavailable

**Problem**: API routes return 503 errors

**Solution**:
1. Check serverless function logs in Vercel
2. Verify environment variables are in the correct environment
3. Redeploy the application

### Rate Limiting

**Problem**: Getting rate limit errors from OpenRouter

**Solution**:
1. Check your OpenRouter usage dashboard
2. Consider upgrading to paid tier for higher limits
3. Implement request caching (if needed)

## Monitoring & Logs

### View Logs

1. Go to your project on Vercel
2. Click on "Deployments"
3. Select a deployment
4. View "Runtime Logs" or "Build Logs"

### Analytics

Enable Vercel Analytics for insights:
1. Go to "Analytics" in project settings
2. Enable Web Analytics (free)
3. View page views, performance metrics, etc.

## Updating Your Deployment

### Automatic Deployments

Vercel automatically deploys:
- **Production**: On push to `main` branch
- **Preview**: On pull requests

### Manual Deployment

1. Push code to your repository
2. Vercel automatically detects and deploys
3. Or trigger manual deploy in Vercel dashboard

## Cost Considerations

### Free Tier Includes:
- Unlimited deployments
- 100 GB bandwidth/month
- Serverless function executions
- Automatic SSL

### OpenRouter Costs:
- Free tier: Limited credits with free models
- Paid models: Pay per token usage
- See pricing: https://openrouter.ai/docs/pricing

## Security Best Practices

1. **Never commit** `.env.local` or API keys to Git
2. Use Vercel's **environment variables** feature
3. Enable **Vercel's Security Headers**
4. Consider adding **rate limiting** for production
5. Rotate API keys periodically

## Support

### Vercel Issues
- Documentation: https://vercel.com/docs
- Support: https://vercel.com/support

### Application Issues
- Check MIGRATION.md for changes
- Review application logs
- File GitHub issue

## Next Steps

After successful deployment:
1. ✅ Share your app URL
2. ✅ Test all features thoroughly
3. ✅ Monitor usage and costs
4. ✅ Collect user feedback
5. ✅ Consider custom domain

Happy deploying! 🚀
