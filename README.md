# Google Cloud Vision API - Reconhecimento de Placas

Este projeto é uma API Node.js que utiliza o [Google Cloud Vision](https://cloud.google.com/vision) para identificar placas de veículos em imagens, retornando os textos das placas detectadas. Ele integra com um endpoint local para buscar imagens em base64 e expõe rotas HTTP para processar e consultar resultados.

## Funcionalidades

- Busca imagens de um endpoint local (`/multas`).
- Usa o Google Cloud Vision para detectar textos (placas) nas imagens.
- Expõe endpoints para processar as imagens e consultar os resultados.

## Requisitos

- Node.js (recomendado v14+)
- Conta no Google Cloud com acesso à API Vision
- Arquivo de credenciais do Google Cloud (JSON)

## Instalação

1. Clone o repositório e acesse a pasta do projeto.
2. Instale as dependências:

   ```bash
   npm install
   # ou
   yarn install
   ```

3. Coloque o arquivo de credenciais do Google Cloud (exemplo: `cultivated-era-456223-p2-5cb794b719c5.json`) na raiz do projeto.

## Configuração

- Certifique-se de que o arquivo de credenciais JSON está correto e atualizado.
- O endpoint de onde as imagens são buscadas está fixo como `http://localhost:5163/multas`. Altere no código se necessário.

## Uso

### Iniciar o servidor

```bash
npm start
# ou
yarn start
```

O servidor estará disponível em `http://localhost:4000`.

### Endpoints

- `POST /processar-multas`  
  Processa as imagens obtidas do endpoint local e retorna as placas identificadas.

- `GET /resultado`  
  Retorna o último resultado processado.

## Exemplo de Requisição

```bash
curl -X POST http://localhost:4000/processar-multas
```

Resposta esperada:
```json
{
  "placas": ["ABC1234", "DEF5G67"]
}
```

## Observações

- O projeto espera que o endpoint `/multas` retorne um array de objetos com imagens em base64 no campo `anexos.evidencia`.
- O reconhecimento de placas é feito via expressão regular sobre os textos detectados pelo Google Vision.

## Licença

ISC