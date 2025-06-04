const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient({
    keyFilename: 'cultivated-era-456223-p2-5cb794b719c5.json',
});

async function identificarCarro(caminhoImagem) {
    try {
        // Realizar detecção de rótulos (para identificar marca ou modelo do carro)
        const [resultadoRótulo] = await client.labelDetection(caminhoImagem);
        const rótulos = resultadoRótulo.labelAnnotations ? resultadoRótulo.labelAnnotations.map(rótulo => rótulo.description.toLowerCase()) : [];

        // Realizar detecção de texto (para tentar identificar a placa do carro)
        const [resultadoTexto] = await client.textDetection(caminhoImagem);
        const textos = resultadoTexto.textAnnotations ? resultadoTexto.textAnnotations.map(texto => texto.description) : [];

        // Realizar detecção de propriedades da imagem (para identificar a cor do carro)
        const [resultadoPropriedades] = await client.imageProperties(caminhoImagem);
        const coresDominantes = resultadoPropriedades.imagePropertiesAnnotation ? resultadoPropriedades.imagePropertiesAnnotation.dominantColors.colors : [];

        // Identificar a cor do carro (cor mais predominante)
        const corCarro = coresDominantes.length > 0 ? coresDominantes[0].color : null;

        // Procurar por textos que possam se assemelhar a uma placa de carro (letras e números)
        const dadosDoVeiculo = textos.find(texto => {
            // Ajustando para detectar possíveis formatos de placa
            const regexPlaca = /([A-Z]{2,3}\d{1,4}[A-Z]{1,2}|\d{1,4}[A-Z]{2,3}\d{1,2})/i; // Placa flexível
            return regexPlaca.test(texto.replace(/\s/g, '').toUpperCase()); // Remove espaços e converte para maiúsculas
        });

        // Retornar os resultados
        const resultado = {
            cor: corCarro ? `rgb(${corCarro.red}, ${corCarro.green}, ${corCarro.blue})` : 'Cor não identificada',
            dadosDoVeiculo: dadosDoVeiculo ? dadosDoVeiculo : 'Dados do veículo não identificados',
        };

        return resultado;

    } catch (err) {
        console.error('Erro ao analisar a imagem:', err);
        throw err;
    }
}

(async () => {
    const caminhoImagem = 'https://autoagora.com.br/wp-content/uploads/8_DSC09303.jpg'; // Substitua com o caminho ou URL da imagem do carro
    const resultado = await identificarCarro(caminhoImagem);
    console.log('Resultado da identificação do carro:', resultado); // Exibe apenas o resultado final
})();
