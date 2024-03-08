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

    // Pegando o título
    respostaFinal['title'] = parsedHtml('h2#product_title').text();

    // Pegando o brand
    respostaFinal['brand'] = parsedHtml('div.brand').text();
    
    // Pegando as categorias
    const categorias = []
    parsedHtml('.current-category>a').each((i, categoria) => {
        const categ = parsedHtml(categoria).text();
        categorias[i] = categ;
    });
    respostaFinal['categories'] = categorias;

    // Pegando a descrição
    respostaFinal['description'] = parsedHtml('.proddet').text();

    // Pegando os skus

    // Vetor que armazena os objetos
    let skus = [];
    parsedHtml('.skus-area div>.card').each((i, s) =>{
        
        // Objeto dos skuls
        let sku = {
            "name": "",
            "current_price": null,
            "old_price": null,
            "available": false
        }

        // Pegando as informações dos skuls
        const name = parsedHtml(s).find('.card-container .prod-nome').text();
        const current_price = parsedHtml(s).find('.card-container .prod-pnow').text();
        const old_price = parsedHtml(s).find('.card-container .prod-pold').text();
        
        sku['name'] = name;                
        
        if(current_price == ''){
            sku['current_price'] = null;
        } else{
            sku['current_price'] = current_price;
        }

        if(old_price == ''){
            sku['old_price'] = null;
        } else{
            sku['old_price'] = old_price;
        }

        if(current_price == '' && current_price == ''){
            sku['available'] = false;
        } else{
            sku['available'] = true;
        }

        skus.push(sku);
    });

    respostaFinal['skus'] = skus;

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