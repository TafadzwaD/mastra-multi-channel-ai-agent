import {SessionDescription} from '@livekit/protocol';
import {
    LiveKitAPI,
    RoomAgentDispatch,
} from 'livekit-server-sdk';
import {z} from 'zod';

const envSchema = z.object({
    WHATSAPP_ACCESS_TOKEN: z.string().min(1),
});

const env = envSchema.parse(process.env);

const livekit = new LiveKitAPI()

const webhookSchema = z.object({
    entry: z.array(
        z.object({
            changes: z.array(
                z.object({
                    field: z.string(),
                    value: z.object({
                        metadata: z.object({
                            phone_number_id: z.string(),
                        }),
                        contacts: z
                            .array(
                                z.object({
                                    profile: z.object({
                                        name: z.string().optional(),
                                    }),
                                    wa_id: z.string().optional(),
                                    user_id: z.string().optional(),
                                }),
                            )
                            .optional(),
                        calls: z
                            .array(
                                z.object({
                                    id: z.string(),
                                    from: z.string().optional(),
                                    from_user_id: z.string().optional(),
                                    event: z.enum(['connect', 'terminate']),
                                    direction: z
                                        .enum([
                                            'USER_INITIATED',
                                            'BUSINESS_INITIATED',
                                        ])
                                        .optional(),
                                    session: z
                                        .object({
                                            sdp_type: z.enum(['offer', 'answer']),
                                            sdp: z.string(),
                                        })
                                        .optional(),
                                }),
                            )
                            .optional(),
                    }),
                }),
            ),
        }),
    ),
});

export const handleWhatsAppCallWebhook = async (
    body: unknown,
): Promise<boolean> => {
    const result = webhookSchema.safeParse(body)

    if (!result.success) {
        return false
    }

    let isCallWebhook = false

    for (const entry of result.data.entry) {
        for (const change of entry.changes) {
            if (change.field !== 'calls') {
                continue
            }

            isCallWebhook = true

            const {value} = change

            for (const call of value.calls ?? []) {
                if (call.event !== 'connect') {
                    continue
                }

                if (call.direction === 'BUSINESS_INITIATED') {
                    continue
                }

                if (
                    !call.session ||
                    call.session.sdp_type !== 'offer'
                ) {
                    throw new Error(
                        `Missing SDP offer for WhatsApp call ${call.id}`,
                    )
                }

                const contact = value.contacts?.[0]

                const callerIdentity =
                    call.from_user_id ??
                    contact?.user_id ??
                    call.from ??
                    contact?.wa_id ??
                    call.id

                await livekit.connector.acceptWhatsAppCall({
                    whatsappPhoneNumberId:
                    value.metadata.phone_number_id,
                    whatsappApiKey:
                    env.WHATSAPP_ACCESS_TOKEN,
                    whatsappCloudApiVersion: '25.0',
                    whatsappCallId: call.id,
                    sdp: new SessionDescription({
                        type: 'offer',
                        sdp: call.session.sdp,
                    }),
                    roomName: `whatsapp-${call.id}`,
                    participantIdentity:
                        `whatsapp:${callerIdentity}`,
                    participantName:
                    contact?.profile.name,
                    participantMetadata: JSON.stringify({
                        platform: 'whatsapp',
                        callId: call.id,
                        phoneNumber:
                            call.from ?? contact?.wa_id,
                    }),
                    agents: [
                        new RoomAgentDispatch({
                            agentName: 'mastra-voice',
                        }),
                    ],
                    waitUntilAnswered: true,
                })
            }
        }
    }

    return isCallWebhook
}
