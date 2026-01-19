import { EndBehaviorType, VoiceReceiver } from "@discordjs/voice";
import { User } from "discord.js";

export function recordVoiceHandler(connection) {
    const receiver: VoiceReceiver = connection.receiver;

    receiver.speaking.on('start', (userId: string) => {

        console.log(`User ${userId} is speaking`)

        const stream = receiver.subscribe(userId, {
            end: {
                behavior: EndBehaviorType.AfterSilence,
                duration: 100
            }
        })

        

        stream.on('end', () => {
            console.log(`User ${userId} parou de falar`);

        });
        console.log(stream)

    });

}