// Bibliotecas que nós instalamos manualmente
const cheerio = require('cheerio');
const request = require('request');

// Bibliotecas nativas do Node.js
const fs = require('fs');

// URL do site
const url = 'https://infosimples.com/vagas/desafio/commercia/product.html';

// Objeto contendo a resposta final
const respostaFinal = {};

// Faz o request e manipula o corpo de resposta
request(url, function (error, response, body) {
    const parsedHtml = cheerio.load(body);

    // Vamos pegar o título do produto, na tag H2, com ID "product_title"
    respostaFinal['title'] = parsedHtml('h2#product_title').text();
    respostaFinal['brand'] = parsedHtml('div.brand').text();
    
    const categorias = []
    parsedHtml('.current-category>a').each((i, categoria) => {
        const categ = parsedHtml(categoria).text();
        categorias[i] = categ;
    });
    respostaFinal['categorias'] = categorias;

    // Aqui você adiciona os outros campos...
    // Gera string JSON com a resposta final
    const jsonRespostaFinal = JSON.stringify(respostaFinal);

    // Salva o arquivo JSON com a resposta final
    fs.writeFile('produto.json', jsonRespostaFinal, function (err) {
        if (err) {
            // Loga o erro (caso ocorra)
            console.log(err);
        } else {
            console.log('Arquivo salvo com sucesso!');
        }
    });
});