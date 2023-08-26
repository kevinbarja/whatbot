
const qrcode = require('qrcode-terminal');

const { Client } = require('whatsapp-web.js');
const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

// Mention everyone
client.on('message', async (msg) => {
    if(msg.body === '!todos') {
        const chat = await msg.getChat();
        //Log chat
        console.log(`Chat id @${JSON.stringify(chat)}`);

        let text = "";
        let mentions = [];

        for(let participant of chat.participants) {
            //const contact = await client.getContactById(participant.id._serialized);
            
            mentions.push(participant.id._serialized);
            text += `@${participant.id.user} `;
        }

        await chat.sendMessage(text, { mentions });
    }
});
 

client.initialize();