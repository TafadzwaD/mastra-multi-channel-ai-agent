# Mastra Multi-Channel AI Agent

A tutorial project showing how to connect a reusable [Mastra](https://mastra.ai/) agent to different messaging channels using Chat SDK adapters.

The goal of this repo is not to rebuild each platform integration from scratch. Instead, it shows how to configure and connect existing tools, adapters, and platform APIs so the same agent logic can be reused across channels.

## YouTube Tutorial Series

This repo accompanies my YouTube tutorial series on building practical AI agents with Mastra, Chat SDK, and messaging platforms.

### WhatsApp Walkthrough

For the full WhatsApp setup walkthrough, watch:

[Build a WhatsApp AI Agent with Mastra Channels + Chat SDK](https://www.youtube.com/watch?v=gegT7OmDOVw&list=PLX8Kj-tc4dHallx-LJ-5uu894S7f52xIC&index=11&pp=iAQBsAgC)

### Telegram Walkthrough

Telegram support is coming soon in the tutorial series.

The Telegram walkthrough will show how to configure the Chat SDK Telegram adapter, start with polling mode for local development, and then move to webhook mode using ngrok.

## What This Project Demonstrates

This project demonstrates a multi-channel AI agent architecture.

The key idea is simple:

```txt
User
→ Messaging Platform
→ Chat SDK Adapter
→ Mastra Agent
→ Tools / Model / Memory
→ Response back to the user
```

The messaging platform should act as the entry point.

The actual agent logic should stay reusable.

That means WhatsApp, Telegram, or any future channel should not require a full rewrite of the agent itself. Each channel should handle platform-specific messaging, while Mastra handles the agent behavior.

## Current Walkthroughs

* WhatsApp setup with Mastra Channels and Chat SDK
* Local development with Mastra Studio
* Environment-based configuration
* Weather tool integration
* Reusable Mastra agent structure

## Planned Tutorial Topics

This repo follows the YouTube tutorial series. These topics are planned walkthroughs for extending the project, not claims that the underlying adapters or platform capabilities are being developed here.

* [x] WhatsApp setup with Mastra Channels and Chat SDK
* [ ] Telegram setup with the Chat SDK Telegram adapter
* [ ] Shared memory across channels
* [ ] Multi-platform user identity
* [ ] Deployment setup
* [ ] Approval workflows and interactive actions

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open:

```txt
http://localhost:4111
```

This opens Mastra Studio, where you can test and inspect your agent locally.

## Environment Variables

Create a `.env` file in the project root.

Example:

```bash
OPENAI_API_KEY=your_openai_api_key_here

WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id_here
WHATSAPP_VERIFY_TOKEN=your_whatsapp_verify_token_here

TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_BOT_USERNAME=your_telegram_bot_username_here
TELEGRAM_WEBHOOK_SECRET_TOKEN=your_telegram_webhook_secret_here
```

Only add the variables for the channels you are actively using.

Do not commit real API keys, bot tokens, access tokens, or webhook secrets to GitHub.

## Project Structure

```txt
src/
  mastra/
    agents/
    tools/
    workflows/
    scorers/
```

Most of the agent logic lives inside `src/mastra`.

The important part is keeping the agent layer reusable. Platform-specific setup should stay close to the relevant adapter or channel configuration.

## Local Development

Mastra Studio runs locally at:

```txt
http://localhost:4111
```

For channels that use webhooks, your local server needs to be reachable from the public internet.

During development, you can use a tunnelling tool like ngrok:

```bash
ngrok http 4111
```

Use the HTTPS forwarding URL from ngrok when configuring webhook-based platforms.

## Useful Links

* [Mastra Documentation](https://mastra.ai/docs/)
* [Mastra Studio](https://mastra.ai/docs/studio/overview)
* [Chat SDK](https://chat-sdk.dev/)
* [WhatsApp Tutorial](https://www.youtube.com/watch?v=gegT7OmDOVw&list=PLX8Kj-tc4dHallx-LJ-5uu894S7f52xIC&index=11&pp=iAQBsAgC)
