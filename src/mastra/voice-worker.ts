import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import { createLiveKitWorker, runLiveKitWorker } from '@mastra/livekit/worker';
import { mastra } from './index';


export default createLiveKitWorker({
    mastra,
    agent: 'support-agent',
    stt: 'deepgram/nova-3',
    tts: 'cartesia/sonic-3.5',
    configuration: {
        greeting: {
            text: "Thanks for calling, you're speaking with an AI assistant. How can I assist you today?",
            allowInterruptions: false,
        },
        endCall: {
            tool: 'endCall',
        },
    },
})

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runLiveKitWorker({ entry: import.meta.url, agentName: 'mastra-voice' })
}
