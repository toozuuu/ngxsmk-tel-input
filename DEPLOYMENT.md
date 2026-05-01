# Deployment Guide

This guide explains how to deploy the demo application to GitHub Pages using GitHub Actions.

## Prerequisites

1. GitHub repository with GitHub Pages enabled
2. GitHub Actions enabled in your repository

## Setup GitHub Pages

1. Go to your repository **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Save the settings

## Automatic Deployment

The demo is automatically deployed when you push to the `main` or `master` branch.

### Workflow File

The deployment workflow is located at `.github/workflows/deploy-demo.yml`

### Manual Deployment

You can also trigger the deployment manually:

1. Go to **Actions** tab in your repository
2. Select **Deploy Demo to GitHub Pages**
3. Click **Run workflow**
4. Select the branch and click **Run workflow**

## Build Configuration

The workflow:
1. Installs dependencies
2. Builds the library (`ngxsmk-tel-input`)
3. Builds the demo application with the correct `base-href`
4. Deploys to GitHub Pages

### Base Href

The `base-href` is automatically set based on your repository name:
- Repository: `owner/ngxsmk-tel-input` → Base href: `/ngxsmk-tel-input/`

If your repository name is different, update the workflow file:
```yaml
--base-href /your-repo-name/
```

## Custom Domain

If you're using a custom domain:

1. Update the `base-href` in the workflow to `/`
2. Configure your custom domain in **Settings** → **Pages** → **Custom domain**

## Troubleshooting

### Build Fails

- Check Node.js version (should be 20)
- Verify all dependencies are in `package.json`
- Check build logs in GitHub Actions

### Pages Not Updating

- Ensure GitHub Pages is set to use **GitHub Actions** as source
- Check workflow run status in **Actions** tab
- Verify the deployment job completed successfully

### 404 Errors

- Verify the `base-href` matches your repository name
- Check that routes are configured correctly in Angular
- Ensure `index.html` has the correct `<base href>` tag

## Local Testing

Test the production build locally:

```bash
# Build with production config
npm run build:demo

# Serve the built files (requires a local server)
npx http-server dist/demo/browser -p 4200
```

Visit `http://localhost:4200` to verify the build works correctly.

## Environment Variables

No environment variables are required for basic deployment. If you need to add environment-specific configurations, add them to the workflow file.

