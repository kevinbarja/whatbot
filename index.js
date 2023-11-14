
const express = require('express');
const qrcode = require('qrcode-terminal');
const bodyParser = require('body-parser');
const app = express();


const { Client, MessageMedia,GroupChat, LocalAuth   } = require('whatsapp-web.js');
const axios = require("axios").default;
const request = require("request");
const FormData = require("form-data");
const fs = require('fs');

// Configuración de Express
app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json({limit: '500mb'}))
// Configuración del cliente de WhatsApp

const API_KEY = "VF.DM.6552db298b57010008df772a.7SuLnnxBoosW4Wjl";

//const client = new Client();
// Use the saved values
const client = new Client({
  authStrategy: new LocalAuth()
});


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
    
    const chats = await client.getChats();
    const chatObjects = chats.filter((chat) => chat.isGroup);
    const labels = chatObjects[0].getLabels();
    //console.log(`${JSON.stringify(chatObjects[0])}`); 

    const groupChats = chatObjects.map((chatObject) => {
        // Cast each chat to a GroupChat type 
        const groupChatObj = {'groupName': chatObject.groupMetadata.subject, 'id': chatObject.groupMetadata.id._serialized};
        return groupChatObj;
      });    
    res.send(JSON.stringify(groupChats));
    console.log(JSON.stringify(groupChats));
    return;

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

app.post('/send-video', async (req, res) => {
  console.log(`send video`);
  const chat = await client.getChatById('59175001599-1527638324@g.us')
  ///console.log(`Chat id @${JSON.stringify(chat)}`);
  let text = "*Te estamos buscando campeón!*\n🕣¿Eres responsable y puntual?\n🤓¿Te animás a utilizar el sistema plan 150?\nEscríbenos al 75632256 (Edu Barja) y formá parte de nuestra comisión de Adjudicación de Entradas 🎫\n\n\n";
  let mentions = [];

  for(let participant of chat.participants) {
      //const contact = await client.getContactById(participant.id._serialized);
      if (participant.id._serialized != '59175001604@c.us' && participant.id._serialized != '59178073154@c.us'
      && participant.id._serialized != '59178518045@c.us' && participant.id._serialized != '59175637765@c.us' && participant.id._serialized != '59177075240@c.us') {
       mentions.push(participant.id._serialized);
       text += `@${participant.id.user} `;
      }
  }

  /*
  const mediaMessage = new MessageMedia('video/mp4', req.body.base64, message);
  client.sendMessage(from_number, mediaMessage, {caption : message, sendMediaAsDocument: true}).then(() => {
    res.send('Mensaje enviado');
  }).catch((error) => {
    res.status(500).send(`Error al enviar el mensaje: ${error}`);
  });
  */

  await chat.sendMessage(text, { mentions });    
  
  res.send('ok');
});


/*
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
*/

function isIterable(obj, prop) {
  return typeof obj[prop] === "object" && typeof obj[prop][Symbol.iterator] === "function";
}

function writeToFile(message) {
  fs.appendFile("logfile.txt", message + "\n", (err) => {
    if (err) {
      console.error('Error writing to the file:', err);
    } else {
      console.log('Data has been written to the file.');
    }
  });
}


client.on('message', async (msg) => {
  const chat = await msg.getChat();
  //Exit if is message group
  if (isIterable(chat, "participants")) return;
  //Exit if isn't text message
  let message = msg.body;
  if (msg.type != 'chat'){
    message = '';
  }
  //Alow only bolivian number with prefix 591
  if (!msg.from.startsWith('591') ) {
    msg.reply('Lo siento, por el momento sólo converso con números de Bolivia. 😔');
    return;
  }

  try {
    const response = await axios({
      method: "POST",
      url: `https://general-runtime.voiceflow.com/state/user/8/interact`,
      headers: { Authorization: API_KEY },
      data: {action: { type: "text", payload: message}}
    });
    //writeToFile(JSON.stringify(response.data));
    if (response.data != [] && response.data.message != '' && msg.from != '59172103001@c.us') {
      const res =response.data;
        // loop through the response
        for (const trace of res) {
          switch (trace.type) {
            case "text":
            case "speak": {
              client.sendMessage( msg.from, trace.payload.message);
              console.log(trace.payload.message);
              break;
            }
            case "end": {
              // an end trace means the the Voiceflow dialog has ended
              return false;
            }
          }
        }

      
    }

    //writeToFile(JSON.stringify(response.data));
  } catch (error) {
    // Manejar el error aquí
    writeToFile('Error al hacer la solicitud:' + JSON.stringify(error));
    if (msg.from != '59172103001@c.us')
    {
      msg.reply('Lo siento, ocurrió un error no controlado. 😔');
    }
  }
});

// Iniciar el cliente de WhatsApp
client.initialize();

// Iniciar el servidor Express
app.listen(app.get('port'), () => {
  console.log(`Servidor iniciado en http://localhost:${app.get('port')}`);
});