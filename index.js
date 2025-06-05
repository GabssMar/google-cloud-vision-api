const fs = require('fs');
const path = require('path');
const express = require('express');
const vision = require('@google-cloud/vision');
const cors = require('cors');
const client = new vision.ImageAnnotatorClient({
  keyFilename: 'cultivated-era-456223-p2-5cb794b719c5.json',
});

const server = express();
server.use(express.json());
server.use(cors());

let ultimoResultado = null;

async function obterAnexos() {
  try {
    const response = await fetch('http://localhost:5163/multas');
    const multas = await response.json();

    return multas
      .filter(multa => multa.anexos && multa.anexos.evidencia)
      .map(multa => multa.anexos.evidencia);
  } catch (error) {
    console.error('Erro ao obter anexos:', error);
    return [];
  }
}

async function identificarPlacas(imagensBase64) {
  const placas = [];
  for (const base64 of imagensBase64) {
    try {
      const request = {
        requests: [
          {
            image: { content: Buffer.from(base64, 'base64') },
            features: [{ type: 'TEXT_DETECTION' }],
          },
        ],
      };
      const [result] = await client.batchAnnotateImages(request);
      const textos = result.responses[0].textAnnotations || [];
      const placa = textos.find((texto) => /\b([A-Z]{3}[0-9]{4}|[A-Z]{3}[0-9][A-Z][0-9]{2})\b/.test(texto.description));
      if (placa) {
        placas.push(placa.description);
      }
    } catch (error) {
      console.error('Erro ao identificar placa:', error);
    }
  }
  return placas;
}

async function processarMultas() {
  const anexos = await obterAnexos();
  const placas = await identificarPlacas(anexos);
  return placas;
}

server.post('/processar-multas', async (req, res) => {
  try {
    const placas = await processarMultas();
    if (placas.length > 0) {
      ultimoResultado = placas; // Guarda o resultado para GET
      return res.json({ placas });
    } else {
      return res.status(404).json({ mensagem: 'Nenhuma placa identificada.' });
    }
  } catch (error) {
    console.error('Erro ao processar as multas:', error);
    return res.status(500).json({ erro: 'Erro interno ao processar as multas.' });
  }
});

server.get('/resultado', (req, res) => {
  if (!ultimoResultado) {
    return res.json({ mensagem: 'Nenhuma imagem processada ainda. Use POST /processar-multas para enviar uma imagem.' });
  }
  return res.json(ultimoResultado);
});

server.listen(4000, () => {
  console.log('Servidor está funcionando na porta 4000');
});
