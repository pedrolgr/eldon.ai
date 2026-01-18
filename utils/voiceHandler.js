import { EndBehaviorType } from "@discordjs/voice";

export function recordVoiceHandler(connection) {
    const receiver = connection.receiver;
    const stream;
    
    receiver.speaking.on('start', (userId) => {
        
        console.log(`User ${userId} is speaking`)

        stream = receiver.subscribe(userId, {
            end: {
            behavior: EndBehaviorType.AfterSilence,
            duration: 1_000
            }
        })

    });

    receiver.speaking.on('end', (userId) => {
        console.log(`User ${userId} stops speaking`)
    })

}