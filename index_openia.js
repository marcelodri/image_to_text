const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Tu clave API de OpenAI
const apiKey = '';
const url = 'https://api.openai.com/v1/chat/completions';

app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public'));

app.post('/upload', async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Imagen no proporcionada' });
  }

  // Los headers de la solicitud
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  // Los datos de la solicitud
  const payload = {
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extrae los textos de la imagen en un formato de clave-valor, asegurándote de excluir los títulos o encabezados y centrarte solo en los datos relevantes. Aquí tienes la imagen. los títulos y encabezados ponlo también como clave-valor. Devuelveme el resultado en formato JSON. A las KEYs que contentan espacios agregale un gion bajo, como te pongo en este ejemplo: 'PROPEIDAD DE' pasa a ser 'PROPRIEDAD_DE'. "
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${image}`
            }
          }
        ]
      }
    ],
    max_tokens: 400
  };

  try {
    const response = await axios.post(url, payload, { headers });
    res.json(response.data);
  } catch (error) {
    console.error('Error en la solicitud a la API:', error);
    if (error.response) {
      res.status(error.response.status).json({ error: error.response.data });
    } else {
      res.status(500).json({ error: 'Error en la solicitud a la API' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
