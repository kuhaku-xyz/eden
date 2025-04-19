# Lens Chat

A real-time chat application built with Next.js, Socket.IO, and Bun.

## Features

- Real-time messaging using WebSockets
- Modern UI with Tailwind CSS
- Connection status indicator
- System notifications for user join/leave events
- Responsive design

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [Bun](https://bun.sh/) for running the server

## Getting Started

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
bun install
```

2. Start the WebSocket server:

```bash
npm run server
# or
yarn server
# or
bun run server
```

3. In a separate terminal, start the Next.js development server:

```bash
npm run dev
# or
yarn dev
# or
bun run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the chat application.

## How It Works

- The client (`src/app/page.tsx`) establishes a WebSocket connection to the server using Socket.IO
- The server (`src/srv/server.ts`) runs on port 3001 and handles real-time communication
- Messages are broadcast to all connected clients except the sender
- The UI displays incoming and outgoing messages with different styling

## Troubleshooting

If you encounter connectivity issues:

1. Make sure both the Next.js server and WebSocket server are running
2. Check that ports 3000 and 3001 are not blocked by firewall or other services
3. Verify that the WebSocket server URL in `src/app/page.tsx` matches your server configuration

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
