# Deployment Instructions for Climbing Relationships Game

## Overview

The Climbing Relationships Game consists of two parts:
1. A Next.js frontend application
2. A Socket.io server for real-time communication

When deploying to Vercel, you need to deploy these two components separately because Vercel doesn't support long-lived WebSocket connections in its serverless environment.

## Step 1: Deploy the Socket.io Server

The Socket.io server needs to be deployed to a platform that supports WebSockets and long-lived connections, such as:
- Heroku
- Railway
- DigitalOcean
- AWS EC2
- Render

### Deployment Steps for Socket.io Server

1. Copy the `socket-server.js` and `socket-server-package.json` files to a new directory
2. Rename `socket-server-package.json` to `package.json`
3. Deploy to your chosen platform following their instructions
4. Make note of the URL where your Socket.io server is deployed (e.g., `https://your-socket-server.example.com`)

### Example: Deploying to Heroku

```bash
# Create a new directory for the Socket.io server
mkdir socket-server
cp socket-server.js socket-server/
cp socket-server-package.json socket-server/package.json

# Initialize Git repository
cd socket-server
git init
git add .
git commit -m "Initial commit"

# Create Heroku app and deploy
heroku create climbing-relationships-socket
git push heroku main

# Your Socket.io server will be available at:
# https://climbing-relationships-socket.herokuapp.com
```

## Step 2: Configure the Next.js Frontend

1. In your Vercel project settings, add an environment variable:
   - Name: `NEXT_PUBLIC_SOCKET_SERVER_URL`
   - Value: The URL of your Socket.io server (e.g., `https://your-socket-server.example.com`)

2. Deploy your Next.js application to Vercel as usual

## Step 3: Test the Deployment

1. Open your deployed Next.js application
2. Check the browser console for any connection errors
3. Try creating and joining a game to ensure the Socket.io connection works

## Troubleshooting

If you encounter connection issues:

1. Check that your Socket.io server is running properly
2. Verify the `NEXT_PUBLIC_SOCKET_SERVER_URL` environment variable is set correctly
3. Check for CORS issues - your Socket.io server should allow requests from your frontend domain
4. Look at the browser console for specific error messages

## Local Development

For local development, you can:

1. Run the Socket.io server: `node socket-server.js`
2. Run the Next.js development server: `cd climbing-game && npm run dev`
3. The frontend will automatically connect to the local Socket.io server

## Notes

- The Socket.io server is configured to accept connections from any origin (`*`). In production, you should restrict this to your frontend domain.
- Make sure your Socket.io server is accessible via HTTPS to avoid mixed content issues when your frontend is served over HTTPS.
