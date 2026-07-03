import { registerApiRoute } from '@mastra/core/server';

export const whatsAppWebHook = registerApiRoute('/custom/whatsapp/webhook', {
    method: 'ALL',
    handler: async (c) => {
        if (c.req.method === 'GET') {
            const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

            const {
                'hub.mode': mode,
                'hub.challenge': challenge,
                'hub.verify_token': token,
            } = c.req.query();

            if (mode === 'subscribe' && token === verifyToken && challenge) {
                return c.text(challenge, 200);
            }

            return c.text('Forbidden', 403);
        }

        if (c.req.method === 'POST') {
            const publicBaseUrl = process.env.PUBLIC_BASE_URL;

            if (!publicBaseUrl) {
                console.error('PUBLIC_BASE_URL is missing');

                return c.text('PUBLIC_BASE_URL is missing', 500);
            }

            const internalUrl = `${publicBaseUrl}/api/agents/weather-agent/channels/whatsapp/webhook`;

            const body = await c.req.raw.clone().arrayBuffer();

            const response = await fetch(internalUrl, {
                method: 'POST',
                headers: c.req.raw.headers,
                body,
            });

            return new Response(response.body, {
                status: response.status,
                headers: response.headers,
            });
        }

        return c.text('Method Not Allowed', 405);
    },
});

