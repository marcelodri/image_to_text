const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public'));

app.post('/upload', async (req, res) => {
  const base64Image = req.body.image;

  const { VertexAI } = require('@google-cloud/vertexai');

  // Initialize Vertex with your Cloud project and location
  const vertex_ai = new VertexAI({ project: 'imagetotext-426422', location: 'southamerica-east1' });
  const model = 'gemini-1.0-pro-vision-001';
  //const model = 'gemini-1.5-flash-001';

  // Instantiate the model
  const generativeModel = vertex_ai.preview.getGenerativeModel({
    model: model,
    generationConfig: {
      'maxOutputTokens': 2048,
      'temperature': 0.4,
      'topP': 0.4,
      'topK': 32,
    },
    safetySettings: [
      {
          'category': 'HARM_CATEGORY_HATE_SPEECH',
          'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
          'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
          'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
          'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
          'category': 'HARM_CATEGORY_HARASSMENT',
          'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
      }
    ],
  });

  const image1 = {
    inlineData: {
      mimeType: 'image/png',
      data: `${base64Image}`
    }
  };

  try {
    const req = {
      contents: [
        { role: 'user', parts: [image1, { text: `Extrae los textos de la imagen en un formato de clave-valor, asegurándote de excluir los títulos o encabezados y centrarte solo en los datos relevantes. Aquí tienes la imagen. los títulos y encabezados ponlo también como clave-valor. Devuelveme el resultado en formato JSON. A las KEYs que contentan espacios agregale un gion bajo, como te pongo en este ejemplo: 'PROPEIDAD DE' pasa a ser 'PROPRIEDAD_DE'. Borra la palabra "json" de la respuesta asi me queda el JSON limpio y luego puedo parsearla con JSOn como js` }] }
      ],
    };

    const streamingResp = await generativeModel.generateContentStream(req);

    let responseData = '';
    for await (const item of streamingResp.stream) {
      responseData += JSON.stringify(item);
    }

    const aggregatedResponse = await streamingResp.response;
    res.json({ result: aggregatedResponse.candidates[0].content.parts[0].text });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
