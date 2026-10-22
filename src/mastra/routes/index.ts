import {
    createHmac,
    timingSafeEqual,
} from 'node:crypto'
import {registerApiRoute} from '@mastra/core/server'
import {handleWhatsAppCallWebhook} from '../whatsapp/handle-whatsapp-call'

const verifyWhatsAppSignature = (
    rawBody: ArrayBuffer,
    signature: string | undefined,
    appSecret: string,
): boolean => {

    if (!signature?.startsWith('sha256=')) {
        return false
    }

    const suppliedDigest = Buffer.from(
        signature.slice('sha256='.length),
        'hex',
    )

    const expectedDigest = Buffer.from(
        createHmac('sha256', appSecret)
            .update(Buffer.from(rawBody))
            .digest('hex'),
        'hex',
    )

    return (
        suppliedDigest.length === expectedDigest.length &&
        timingSafeEqual(suppliedDigest, expectedDigest)
    )
}

export const whatsAppWebHook = registerApiRoute(
    '/custom/whatsapp/webhook',
    {
        method: 'ALL',
        requiresAuth: false,
        handler: async (c) => {
            if (c.req.method === 'GET') {
                const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

                const {
                    'hub.mode': mode,
                    'hub.challenge': challenge,
                    'hub.verify_token': token,
                } = c.req.query()

                if (
                    mode === 'subscribe' &&
                    token === verifyToken && challenge
                ) {
                    return c.text(challenge, 200)
                }

                return c.text('Forbidden', 403)
            }

            if (c.req.method !== 'POST') {
                return c.text('Method Not Allowed', 405)
            }

            const appSecret =
                process.env.WHATSAPP_APP_SECRET

            if (!appSecret) {
                console.error('WHATSAPP_APP_SECRET is missing',)

                return c.text('WHATSAPP_APP_SECRET is missing', 500,
                )
            }

            const rawBody =
                await c.req.raw.arrayBuffer()

            const signature = c.req.header(
                'x-hub-signature-256',
            )

            const validSignature =
                verifyWhatsAppSignature(
                    rawBody,
                    signature,
                    appSecret,
                )

            if (!validSignature) {
                return c.text('Invalid signature', 401)
            }

            let body: unknown

            try {
                body = JSON.parse(
                    Buffer.from(rawBody).toString('utf8'),
                )
            } catch {
                return c.text('Invalid JSON', 400)
            }

            const handledCall =
                await handleWhatsAppCallWebhook(body)

            if (handledCall) {
                return c.json(
                    {
                        success: true,
                        type: 'call',
                    },
                    200,
                )
            }

            const publicBaseUrl =
                process.env.PUBLIC_BASE_URL

            if (!publicBaseUrl) {
                console.error(
                    'PUBLIC_BASE_URL is missing',
                )

                return c.text(
                    'PUBLIC_BASE_URL is missing',
                    500,
                )
            }

            const port = process.env.MASTRA_SERVER_PORT ?? '4111'

            const internalUrl =
                `http://127.0.0.1:4111/api/agents/weather-agent/channels/whatsapp/webhook`

            const headers = new Headers(
                c.req.raw.headers,
            )

            headers.delete('host')
            headers.delete('content-length')

            const response = await fetch(internalUrl, {
                method: 'POST',
                headers,
                body: Buffer.from(rawBody),
            })

            return new Response(response.body, {
                status: response.status,
                headers: response.headers,
            })
        },
    },
)
