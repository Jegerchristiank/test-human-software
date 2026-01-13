# Vercel Speed Insights Setup Guide

This guide will help you get started with Vercel Speed Insights on the Human Biologi Studio project. Speed Insights helps you monitor and optimize your application's performance metrics.

## Prerequisites

- A Vercel account (already configured for this project)
- Vercel CLI installed (or use Vercel Dashboard)
- The `@vercel/speed-insights` package (will be installed)

## Setup Steps

### 1. Enable Speed Insights in Vercel Dashboard

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select the **test-human-software** project
3. Navigate to the **Speed Insights** tab
4. Click **Enable** to activate Speed Insights for this project

> **Note:** Enabling Speed Insights will add new routes at `/_vercel/speed-insights/*` after your next deployment.

### 2. Add `@vercel/speed-insights` Package

The package has been added to `package.json` with the following command:

```bash
npm install @vercel/speed-insights
```

Or using your preferred package manager:

```bash
# Using pnpm
pnpm add @vercel/speed-insights

# Using yarn
yarn add @vercel/speed-insights

# Using bun
bun add @vercel/speed-insights
```

### 3. Initialize Speed Insights in Your Application

Since this project is a vanilla JavaScript application (not using a framework like Next.js), Speed Insights is initialized using the `injectSpeedInsights()` function.

The integration has been added to `app.js` at the top of the file to ensure it loads early in the application lifecycle:

```javascript
// Early in app.js
import { injectSpeedInsights } from '@vercel/speed-insights';

// Call once during app initialization (before main app setup)
injectSpeedInsights();
```

This initialization:
- Automatically loads the Speed Insights tracking script
- Collects Web Vitals metrics (LCP, FID, CLS, etc.)
- Sends performance data to Vercel's dashboard
- Requires no additional configuration

### 4. Verify the Integration

After deploying to Vercel, you can verify that Speed Insights is working:

1. Open your deployed application in a browser
2. Open Developer Tools (F12)
3. Look for the `/_vercel/speed-insights/script.js` script in the Network tab
4. Check the Console for any Speed Insights-related messages

Alternatively, check that the script is loaded:
```javascript
// In the browser console
console.log(window.si); // Should be defined
```

### 5. Deploy to Vercel

Deploy your application to make Speed Insights active:

```bash
# Using Vercel CLI
vercel deploy

# Or push to main branch if connected to GitHub/GitLab/Bitbucket
git push origin main
```

### 6. View Your Performance Data

Once deployed and users have visited your site:

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select the **test-human-software** project
3. Click the **Speed Insights** tab
4. Wait a few minutes for initial data collection
5. After a few hours/days, metrics will be aggregated

## Metrics Collected

Speed Insights automatically collects Web Vitals metrics:

- **Largest Contentful Paint (LCP)**: How quickly the largest visible content loads
- **First Input Delay (FID)**: Responsiveness to user interactions
- **Cumulative Layout Shift (CLS)**: Visual stability of the page
- **Time to First Byte (TTFB)**: Server response time
- **First Contentful Paint (FCP)**: When first content appears
- **Next Paint (INP)**: Interaction response time

## Performance Optimization Tips

Based on the Speed Insights data, consider:

### For LCP (Largest Contentful Paint)
- Optimize images and lazy-load non-critical images
- Minimize critical rendering path resources
- Use efficient image formats (WebP)
- Consider code splitting for large bundles

### For CLS (Cumulative Layout Shift)
- Reserve space for dynamically loaded content
- Avoid inserting content above existing content
- Use `font-display: swap` for custom fonts

### For FID/INP (Interaction Response)
- Break up long JavaScript tasks
- Use web workers for heavy computation
- Defer non-critical JavaScript parsing

## Monitoring Real User Data

The Speed Insights dashboard provides insights into:
- Real user metrics (RUM) from your actual visitors
- Performance trends over time
- Performance comparison between different pages
- User experience scores based on Web Vitals

## Privacy and Data Compliance

Speed Insights complies with privacy standards:
- No personally identifiable information (PII) is collected
- Metrics are anonymized
- Data is only collected from actual users who visit your site
- Follows privacy regulations (GDPR, CCPA, etc.)

For more information, see [Vercel Speed Insights Privacy Policy](https://vercel.com/docs/speed-insights/privacy-policy).

## Customization Options

For advanced use cases, you can customize Speed Insights behavior. Currently, this project uses the default configuration. To customize:

1. Check the [Speed Insights Package Documentation](https://vercel.com/docs/speed-insights/package) for available options
2. Update the `injectSpeedInsights()` call in `app.js` with configuration options
3. Redeploy to Vercel

## Troubleshooting

### Speed Insights not appearing in dashboard
- Ensure Speed Insights is enabled in the Vercel project settings
- Wait at least 5-10 minutes after deployment
- Wait for real users to visit the site (metrics require actual traffic)
- Check that the project is deployed on Vercel (not local development)

### Script not loading
- Check browser console for errors
- Verify `/_vercel/speed-insights/script.js` is accessible
- Ensure CSP headers allow loading the Speed Insights script
- Check that the package is properly installed

### No metrics showing
- Speed Insights needs real user traffic to collect data
- Local development or isolated testing won't generate metrics
- Wait for several hours/days of traffic for comprehensive data
- Check that users' browsers support Web Vitals APIs

## Related Resources

- [Speed Insights Documentation](https://vercel.com/docs/speed-insights)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Performance Metrics](https://vercel.com/docs/speed-insights/metrics)
- [Speed Insights Package Reference](https://vercel.com/docs/speed-insights/package)
- [Speed Insights Limits and Pricing](https://vercel.com/docs/speed-insights/limits-and-pricing)

## Next Steps

1. Deploy the updated code to Vercel
2. Monitor performance metrics in the Speed Insights dashboard
3. Use the insights to optimize critical performance areas
4. Track improvements over time as optimizations are implemented
