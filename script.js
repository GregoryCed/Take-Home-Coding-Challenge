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
    respostaFinal['description'] = parsedHtml('.proddet p').text();

    // Pegando os skus

    // Vetor que armazena os objetos
    let skus = [];
    parsedHtml('.skus-area div>.card').each((i, s) =>{
        
        // Objeto dos skuls
        let sku = {
            "name": String,
            "current_price": Float32Array,
            "old_price": Float32Array,
            "available": Boolean
        }

        // Pegando as informações dos skuls
        const name = parsedHtml(s).find('.card-container .prod-nome').text();
        const current_price = parsedHtml(s).find('.card-container .prod-pnow').text().trim().slice(3).replace(',', '.');
        const old_price = parsedHtml(s).find('.card-container .prod-pold').text().trim().slice(3).replace(',', '.');    

        // Atualizando as informações do objeto
        sku['name'] = name;                

        if(current_price == ''){
            sku['current_price'] = null;
        } else{
            sku['current_price'] = parseFloat(current_price);
        }

        if(old_price == ''){
            sku['old_price'] = null;
        } else{
            sku['old_price'] = parseFloat(old_price);
        }

        if(current_price == '' && current_price == ''){
            sku['available'] = false;
        } else{
            sku['available'] = true;
        }

        // Passando o ojeto para o vetor
        skus.push(sku);
    });

    // Pssando o vetor de objetos para a resposta final
    respostaFinal['skus'] = skus;

    // Pegando as Propriedades

    // Vetor que armazena os objetos
    let propriedades = [];
    parsedHtml('.pure-table tbody>tr').each((i, propt) => {

        // Objeto das propriedades
        let propriedade = {
            'label': '',
            'value': ''
        }

        // Pegando as propriedades
        const label = parsedHtml(propt).find('td b').text();
        const value = parsedHtml(propt).find('td').eq(1).text();

        // Passando as informações para o objeto
        propriedade['label'] = label;
        propriedade['value'] = value;

        // Passando o objeto para o vetor
        propriedades.push(propriedade);
    })

    // Passando o vetor de objetos para a resposta final
    respostaFinal['properties'] = propriedades;

    // Pegando as Reviews
    
    // Vetor que armazenará os objetos das reviews
    let reviews = [];
    parsedHtml('.analisebox').each((i, rev) => {

        // Objeto das reviews
        let review = {
            'name': String,
            'date': String,
            'score': Int8Array,
            'text': String
        }

        // Pegando as informações das reviews
        const name = parsedHtml(rev).find('.pure-g .pure-u-21-24 .analiseusername').text();
        const date = parsedHtml(rev).find('.pure-g .pure-u-21-24 .analisedate').text();
        const score = parsedHtml(rev).find('.pure-g .pure-u-21-24 .analisestars').text();
        const text = parsedHtml(rev).find('p').text();

        // Passando as reviews para o objeto
        review['name'] = name;
        review['date'] = date;        
        review['text'] = text;

        // Verificando o número de estrelas
        // E passando o valor respectivo para o objeto
        if(score == '☆☆☆☆☆'){
            review['score'] = 0;
        } else if (score == '★☆☆☆☆'){
            review['score'] = 1;
        }else if (score == '★★☆☆☆'){
            review['score'] = 2;
        }else if (score == '★★★☆☆'){
            review['score'] = 3;
        }else if (score == '★★★★☆'){
            review['score'] = 4;
        } else{
            review['score'] = 5;
        }

        //Passando o objeto para o vetor das reviews
        reviews.push(review);
    })
    
    // Passando o vetor de objetos para a resposta final
    respostaFinal['reviews'] = reviews;

    // Pegando o Avarage score e tratando a string
    const reviews_average_score = parsedHtml('#comments h4').text().slice(15, 18);

    // Passando para a resposta final transformando o valor string em float
    respostaFinal['reviews_average_score']  = parseFloat(reviews_average_score);

    // Passando a url do produto para a resposta final
    respostaFinal['url'] = url;
    
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