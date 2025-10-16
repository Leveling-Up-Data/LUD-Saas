# Custom Domain Setup for Cloud Run

## Overview
Your Cloud Run service has been successfully mapped to the custom domain `starfish.levelingupdata.com`.

## DNS Configuration Required

To complete the setup, you need to configure the following DNS record in your domain registrar or DNS provider:

### DNS Record to Add:
- **Type**: `CNAME`
- **Name**: `starfish`
- **Value**: `ghs.googlehosted.com.`
- **TTL**: 300 (or default)

## Steps to Configure DNS:

1. **Log into your domain registrar** (where you manage `levelingupdata.com`)
2. **Navigate to DNS management** or DNS settings
3. **Add a new CNAME record** with the following details:
   - **Host/Name**: `starfish`
   - **Points to/Target**: `ghs.googlehosted.com.`
   - **TTL**: 300 seconds (or leave as default)

## Verification

After adding the DNS record:

1. **Wait for DNS propagation** (usually 5-15 minutes, but can take up to 48 hours)
2. **Check the domain mapping status**:
   ```bash
   gcloud beta run domain-mappings describe starfish.levelingupdata.com --region=us-central1
   ```
3. **Test the domain**: Visit `https://starfish.levelingupdata.com` to verify it's working

## Current Status

- ✅ **Domain mapping created**: `starfish.levelingupdata.com` → `lud-saas-236427008905.us-central1.run.app`
- ⏳ **DNS configuration pending**: Add the CNAME record as specified above
- ⏳ **SSL certificate pending**: Will be automatically provisioned once DNS is configured

## Troubleshooting

If the domain doesn't work after DNS propagation:

1. **Check DNS propagation**: Use tools like `dig starfish.levelingupdata.com` or online DNS checkers
2. **Verify CNAME record**: Ensure it points exactly to `ghs.googlehosted.com.` (with trailing dot)
3. **Check domain mapping status**: Run the describe command above to see if certificate provisioning is complete

## URLs After Setup

Once DNS is configured and SSL certificate is provisioned:
- **Main Application**: `https://starfish.levelingupdata.com`
- **PocketBase API**: `https://pb.levelingupdata.com`
- **PocketBase Admin**: `https://pb.levelingupdata.com/_/`
