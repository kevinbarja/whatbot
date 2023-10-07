const express = require('express');
const qrcode = require('qrcode-terminal');
const bodyParser = require('body-parser');
const app = express();
const { Client, MessageMedia, GroupChat } = require('whatsapp-web.js');
// Configuración de Express
app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json({limit: '500mb'}))
// Configuración del cliente de WhatsApp

const client = new Client();

  client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
  })

// Evento al iniciar sesión
client.on('authenticated', (session) => {
  console.log('Cliente autenticado');
  // Puedes guardar la sesión en una base de datos o en disco si deseas mantener la sesión entre reinicios del servidor
  // Guardar la sesión: fs.writeFileSync('session.json', JSON.stringify(session));
});

// Ruta para enviar mensajes
app.post('/send', async (req, res) => {
    /*
    const chats = await client.getChats();
    const chatObjects = chats.filter((chat) => chat.isGroup);
    const labels = chatObjects[0].getLabels();
    //console.log(`${JSON.stringify(chatObjects[0])}`); 

    const groupChats = chatObjects.map((chatObject) => {
        // Cast each chat to a GroupChat type 
        const groupChatObj = {'groupName': chatObject.groupMetadata.subject, 'id': chatObject.groupMetadata.id._serialized};
        return groupChatObj;
      });    
    */
    const chat = await client.getChatById('')
    ///console.log(`Chat id @${JSON.stringify(chat)}`);
    let text = "¿Qué dice la masa? Junte?\n\n\n";
    let mentions = [];

    for(let participant of chat.participants) {
        //const contact = await client.getContactById(participant.id._serialized);
        if (participant.id._serialized != '59175001604@c.us' && participant.id._serialized != '59178073154@c.us'
        && participant.id._serialized != '59178518045@c.us' && participant.id._serialized != '59175637765@c.us') {
         mentions.push(participant.id._serialized);
         text += `@${participant.id.user} `;
        }
    }

    await chat.sendMessage(text, { mentions });    
    
    res.send('ok');
});

client.on('message', async (msg) => {
    if(msg.body === '!edu') {
        const chat = await client.getChatById('59178002823-1422484064@g.us')
        //Log chat
        console.log(`Chat id @${JSON.stringify(chat)}`);
        return;
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

// Iniciar el cliente de WhatsApp
client.initialize();

// Iniciar el servidor Express
app.listen(app.get('port'), () => {
  console.log(`Servidor iniciado en http://localhost:${app.get('port')}`);
});