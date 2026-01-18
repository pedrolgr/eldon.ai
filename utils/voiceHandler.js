import { EndBehaviorType } from "@discordjs/voice";

export function recordVoiceHandler(connection) {
    const receiver = connection.receiver;

    receiver.speaking.on('start', (userId) => {

        console.log(`User ${userId} is speaking`)

        const stream = receiver.subscribe(userId, {
            end: {
                behavior: EndBehaviorType.AfterSilence,
                duration: 1_000
            }
        })

        stream.on('data', () => { });

        stream.on('end', () => {
            console.log(`User ${userId} parou de falar`);
        });

    });

}