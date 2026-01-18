# Production Deployment Guide

## Prerequisites

1. **Stripe Account** (for payment processing)
   - Sign up at https://stripe.com
   - Get your API keys from https://dashboard.stripe.com/apikeys
   - Set up webhook endpoint for payment confirmations

2. **MongoDB Atlas** (cloud database)
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create a cluster and get connection string

3. **Domain & SSL Certificate**
   - Required for production
   - Use Let's Encrypt for free SSL

## Step-by-Step Setup

### 1. Configure Stripe

1. Go to Stripe Dashboard: https://dashboard.stripe.com
2. Navigate to Developers > API Keys
3. Copy your **Publishable key** (starts with `pk_live_...`)
4. Copy your **Secret key** (starts with `sk_live_...`)
5. Set up webhook:
   - Go to Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/payment/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the webhook signing secret

### 2. Environment Variables

Create `.env` file with production values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dice-game?retryWrites=true&w=majority
JWT_SECRET=use_strong_random_secret_here_at_least_32_characters
NODE_ENV=production

# Stripe Live Keys
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Production URL
FRONTEND_URL=https://yourdomain.com
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Security Checklist

- [ ] Use HTTPS only (no HTTP in production)
- [ ] Use live Stripe keys (not test keys)
- [ ] Set strong JWT_SECRET (min 32 characters)
- [ ] Enable MongoDB authentication
- [ ] Set up rate limiting on API endpoints
- [ ] Implement CAPTCHA for registration
- [ ] Enable CORS only for your domain
- [ ] Use environment variables (never commit .env)
- [ ] Set secure cookie flags
- [ ] Implement CSP headers

### 5. Legal Requirements

⚠️ **IMPORTANT**: Before accepting real money, ensure:

1. **Gambling License**: Check if your jurisdiction requires a license
2. **Terms of Service**: Create comprehensive terms
3. **Privacy Policy**: GDPR/CCPA compliance
4. **Age Verification**: Implement age verification (18+/21+)
5. **Responsible Gaming**: Add self-exclusion features
6. **AML/KYC**: Anti-money laundering & Know Your Customer
7. **Tax Reporting**: Set up proper tax reporting
8. **Business Registration**: Register as a legitimate business

### 6. Additional Production Features to Implement

1. **Rate Limiting**
   ```bash
   npm install express-rate-limit
   ```

2. **Helmet for Security Headers**
   ```bash
   npm install helmet
   ```

3. **Logging**
   ```bash
   npm install winston
   ```

4. **Monitoring**
   - Implement error tracking (Sentry)
   - Set up uptime monitoring
   - Add performance monitoring

5. **Backup Strategy**
   - Automated daily database backups
   - Store backups in separate location

### 7. Testing Before Launch

- [ ] Test deposits with real Stripe payments
- [ ] Test withdrawal process end-to-end
- [ ] Verify 24-hour lock works correctly
- [ ] Test game fairness (ensure randomness)
- [ ] Load testing (can handle concurrent users)
- [ ] Security audit (penetration testing)
- [ ] Mobile device testing
- [ ] Cross-browser testing

### 8. Deployment Options

**Option A: VPS (DigitalOcean, Linode, AWS EC2)**
```bash
# Install Node.js
# Install MongoDB or use Atlas
# Clone repository
# Install dependencies
# Configure PM2 for process management
npm install -g pm2
pm2 start server.js --name dice-game
pm2 startup
pm2 save

# Set up Nginx reverse proxy
# Configure SSL with Let's Encrypt
```

**Option B: Heroku**
```bash
heroku create your-dice-game
heroku addons:create mongolab
heroku config:set STRIPE_SECRET_KEY=sk_live_...
git push heroku main
```

**Option C: Docker**
```bash
# Build and deploy with Docker
docker-compose up -d
```

### 9. Post-Launch

1. Monitor Stripe dashboard for payments
2. Set up customer support system
3. Monitor error logs daily
4. Regular security audits
5. Implement fraud detection
6. Add analytics (Google Analytics, etc.)

### 10. Scaling Considerations

When you grow:
- Use Redis for session management
- Implement CDN for static assets
- Use load balancer for multiple servers
- Implement caching strategy
- Set up read replicas for database

## Support

For production deployment assistance or questions about compliance, consult with:
- Legal counsel (for gambling laws)
- Certified accountant (for tax compliance)
- Stripe support (for payment integration)
- Security experts (for penetration testing)

---

**DISCLAIMER**: This application involves real money gambling. Ensure full compliance with all local, state, and federal laws before deployment. The developers are not responsible for any legal issues arising from improper use.
