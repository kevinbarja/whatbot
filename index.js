
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
    if(msg.body === '!everyone') {
        const chat = await msg.getChat();
        
        let text = "";
        let mentions = [];

        for(let participant of chat.participants) {
            const contact = await client.getContactById(participant.id._serialized);
            
            mentions.push(contact);
            text += `@${participant.id.user} `;
        }

        await chat.sendMessage(text, { mentions });
    }
    if(msg.body === '!id') {
        const chat = await msg.getChat();
        console.log(`Chat id @${JSON.stringify(chat.id)}`);
    }
});
 

client.initialize();