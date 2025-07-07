# Google MCP Server Setup Guide

## Overview
This MCP server provides access to Google services (Gmail, Google Docs, Google Drive) through the Model Context Protocol. It supports both OAuth 2.0 and Service Account authentication.

## Prerequisites
- Node.js 18 or higher
- TypeScript
- Google Cloud Project with required APIs enabled

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Gmail API
   - Google Docs API
   - Google Drive API

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Select "Desktop Application"
   - Download the JSON file

### 2. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your OAuth credentials:
   ```
   GOOGLE_CLIENT_ID=your_client_id_from_json
   GOOGLE_CLIENT_SECRET=your_client_secret_from_json
   GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
   ```

### 3. Build and Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the TypeScript code:
   ```bash
   npm run build
   ```

3. Run the server:
   ```bash
   npm start
   ```

## Authentication Flow

### OAuth 2.0 (Recommended for personal use)

1. Use the `oauth_authenticate` tool to get the authorization URL
2. Visit the URL and authorize the application
3. Copy the authorization code from the callback
4. Use the `oauth_complete` tool with the authorization code
5. The server will save tokens and automatically refresh them

### Service Account (For server deployments)

1. Create a service account in Google Cloud Console
2. Download the service account key JSON file
3. Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the file path

## Available Tools

### OAuth Tools (when using OAuth 2.0)
- `oauth_authenticate` - Start OAuth flow
- `oauth_complete` - Complete OAuth with authorization code
- `oauth_status` - Check authentication status

### Gmail Tools
- `gmail_send_email` - Send emails via Gmail
- `gmail_list_emails` - List recent emails

### Google Docs Tools
- `docs_create_document` - Create new documents
- `docs_read_document` - Read document content
- `docs_update_document` - Update document content (append/replace)

### Google Drive Tools
- `drive_list_files` - List files in Drive

## Example Usage

1. First, authenticate (OAuth 2.0):
   ```json
   {
     "tool": "oauth_authenticate"
   }
   ```

2. Complete authentication with the code:
   ```json
   {
     "tool": "oauth_complete",
     "arguments": {
       "code": "your_authorization_code"
     }
   }
   ```

3. Send an email:
   ```json
   {
     "tool": "gmail_send_email",
     "arguments": {
       "to": "recipient@example.com",
       "subject": "Test Email",
       "body": "Hello from MCP Server!"
     }
   }
   ```

4. Create a document:
   ```json
   {
     "tool": "docs_create_document",
     "arguments": {
       "title": "My New Document",
       "content": "This is the initial content."
     }
   }
   ```

## Security Notes

- OAuth tokens are stored in `google-oauth-token.json` in the project root
- Tokens are automatically refreshed when expired
- Never commit your `.env` file or token files to version control
- Use appropriate scopes for your use case

## Troubleshooting

1. **Authentication errors**: Check that your OAuth credentials are correct and the redirect URI matches
2. **API errors**: Ensure the required Google APIs are enabled in your project
3. **Permission errors**: Make sure the user has granted the necessary permissions during OAuth flow
4. **Token refresh errors**: Delete the `google-oauth-token.json` file and re-authenticate

## Required Scopes

The server requests the following OAuth scopes:
- `https://www.googleapis.com/auth/documents` - Google Docs access
- `https://www.googleapis.com/auth/drive.readonly` - Read-only Drive access
- `https://www.googleapis.com/auth/drive.file` - Drive file access
- `https://www.googleapis.com/auth/gmail.send` - Send emails
- `https://www.googleapis.com/auth/gmail.readonly` - Read emails
..."
  }
}
```

**Search for Unread Emails:**
```json
{
  "tool": "gmail_list_emails",
  "arguments": {
    "query": "is:unread",
    "maxResults": 5
  }
}
```

### Document Management Examples

**Create a Meeting Notes Document:**
```json
{
  "tool": "docs_create_document",
  "arguments": {
    "title": "Team Meeting Notes - December 2024",
    "content": "# Meeting Agenda\\n1. Project Status\\n2. Next Steps\\n3. Action Items"
  }
}
```

**Read Document Content:**
```json
{
  "tool": "docs_read_document",
  "arguments": {
    "documentId": "1ABC123xyz..."
  }
}
```

**Append to Document:**
```json
{
  "tool": "docs_update_document",
  "arguments": {
    "documentId": "1ABC123xyz...",
    "content": "\\n\\n## Follow-up Items\\n- Review budget\\n- Schedule next meeting",
    "action": "append"
  }
}
```

### Drive File Management

**List Recent Documents:**
```json
{
  "tool": "drive_list_files",
  "arguments": {
    "query": "mimeType='application/vnd.google-apps.document'",
    "maxResults": 10
  }
}
```

**Search for Specific Files:**
```json
{
  "tool": "drive_list_files", 
  "arguments": {
    "query": "name contains 'budget' and modifiedTime > '2024-12-01T00:00:00'"
  }
}
```

---

## Troubleshooting

### Common Issues & Solutions

#### Authentication Errors

**Problem:** "Authentication required" error
**Solutions:**
1. Check OAuth token expiration: `oauth_status`
2. Re-authenticate: `oauth_authenticate` → `oauth_complete`
3. Verify environment variables in `.env`
4. Check Google Cloud API permissions

**Problem:** Token refresh fails
**Solutions:**
1. Delete `google-oauth-token.json` and re-authenticate
2. Verify OAuth credentials are correct
3. Check internet connectivity
4. Ensure redirect URI matches Google Cloud settings

#### API Permission Errors

**Problem:** "Insufficient permissions" or 403 errors
**Solutions:**
1. Verify required APIs are enabled in Google Cloud
2. Check OAuth scopes include necessary permissions
3. For service accounts, ensure proper IAM roles
4. Share resources with service account email

#### File/Document Not Found

**Problem:** Document ID not found errors
**Solutions:**
1. Verify document ID is correct (from URL or Drive API)
2. Check document sharing permissions
3. Ensure document hasn't been deleted
4. Use `drive_list_files` to find correct document ID

### Debug Mode

Enable detailed logging by setting:
```env
NODE_ENV=development
```

### Log Files

Server logs are output to stderr and include:
- Authentication status
- API request details
- Error messages with stack traces

### OAuth Callback Server

For troubleshooting OAuth flow, run the callback server:
```bash
npm run oauth-server
```

This starts a local server at `http://localhost:3000` to handle OAuth redirects.

---

## Advanced Features

### Resource Endpoints

The server provides resource endpoints for direct data access:

#### Gmail Inbox Resource
```
URI: google://gmail/inbox
Description: Recent emails from Gmail inbox
MIME Type: application/json
```

#### Recent Drive Files Resource  
```
URI: google://drive/recent
Description: Recently accessed Google Drive files
MIME Type: application/json
```

### Custom Gmail Queries

Advanced Gmail search operators:
```
- has:attachment          # Emails with attachments
- larger:10M             # Emails larger than 10MB
- older_than:7d          # Emails older than 7 days
- in:sent               # Sent emails
- label:important       # Important emails
- from:me to:you        # Complex sender/recipient
```

### Document Text Extraction

The server includes sophisticated text extraction that handles:
- **Paragraphs**: Regular text content
- **Tables**: Cell content extraction
- **Formatting**: Preserves basic structure
- **Rich Text**: Converts to plain text

### Automatic Token Management

The server automatically:
- **Refreshes Tokens**: When access tokens expire
- **Saves Tokens**: Persists tokens to disk
- **Handles Errors**: Graceful degradation on auth failures
- **Validates Scope**: Ensures proper permissions

---

## Security Best Practices

### Environment Security

1. **Never Commit Secrets**
   ```gitignore
   .env
   google-oauth-token.json
   credentials.json
   ```

2. **Use Environment Variables**
   ```env
   # Preferred: Environment variables
   GOOGLE_ACCESS_TOKEN=...
   GOOGLE_REFRESH_TOKEN=...
   
   # Avoid: Hardcoded credentials
   ```

3. **Secure File Permissions**
   ```bash
   chmod 600 .env
   chmod 600 google-oauth-token.json
   ```

### OAuth Security

1. **Use HTTPS in Production**
   ```env
   GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/callback
   ```

2. **Limit OAuth Scopes**
   - Only request necessary permissions
   - Regularly audit granted scopes
   - Use read-only scopes when possible

3. **Token Rotation**
   - Tokens automatically refresh
   - Monitor token expiration
   - Implement proper error handling

### Service Account Security

1. **Principle of Least Privilege**
   - Grant minimum required IAM roles
   - Use specific resource permissions
   - Regularly audit service account access

2. **Key Management**
   - Rotate service account keys regularly
   - Use Google Cloud KMS for key encryption
   - Monitor key usage in Cloud Audit Logs

### Network Security

1. **Firewall Configuration**
   - Restrict OAuth callback server access
   - Use internal networks for service accounts
   - Monitor unusual API traffic

2. **API Usage Monitoring**
   - Set up quota monitoring
   - Enable audit logging
   - Monitor for unusual access patterns

### Data Privacy

1. **Data Handling**
   - Follow data retention policies
   - Implement proper data encryption
   - Respect user privacy settings

2. **Compliance**
   - Adhere to GDPR/CCPA requirements
   - Implement data access controls
   - Maintain audit trails

---

## Performance Optimization

### Request Optimization

1. **Batch Operations**
   - Use batch APIs when available
   - Minimize individual API calls
   - Implement request queuing

2. **Caching Strategy**
   - Cache document metadata
   - Implement rate limiting
   - Use conditional requests

### Error Handling

1. **Retry Logic**
   - Exponential backoff for rate limits
   - Automatic retry for transient errors
   - Circuit breaker pattern

2. **Monitoring**
   - Track API usage quotas
   - Monitor response times
   - Set up alerting for failures

