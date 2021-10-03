let tress = require('tress');
let needle = require('needle');
let resolve = require('url').resolve;
let parse = require('node-html-parser').parse;
let fs = require('fs');
let counter = 0;
const MAX_PAGES = 10000;

const URL = 'https://rozetka.com.ua/mobile-phones/c80003/';
const results_pages = [];
const results_reviews = [];

let reviews_parser = tress(function(url, callback) {
    needle.get(url, function(err, res) {
        if (err) throw err;

        // парсим DOM
        let $ = parse(res.body);
        
        if (res.statusCode === 301) {
            if (counter < MAX_PAGES) {
                reviews_parser.push('https://rozetka.com.ua' + res.headers.location);
                counter++;
            }
            callback();
            return;
        }
        
        $.querySelectorAll('.product-comments__list-item').forEach(el => {
            let rating = 0;
            el.querySelectorAll('.rating-stars__item path').forEach(el => { 
                if (el.getAttribute('fill') === 'url(#1)') {
                    rating++;
                }
                
            });
            
            results_reviews.push({
                rating: rating,
                comment: el.querySelector('.comment__text') ? el.querySelector('.comment__text').innerHTML : null
            }); 
        });

        callback();
    });
}, 10);

reviews_parser.drain = function(){
    fs.writeFileSync('./data-reviews.json', JSON.stringify(results_reviews, null, 4));
}

let page = 2;

let pages_parser = tress(function(url, callback) {
    needle.get(url, function(err, res) {
        if (err) throw err;

        // парсим DOM
        let $ = parse(res.body);
        
        $.querySelectorAll('.catalog-grid__cell').forEach(el => {
            results_pages.push({
                title: el.querySelector('.goods-tile__title').innerHTML,
                href: el.querySelector('.goods-tile__heading').getAttribute('href')
            }); 
            reviews_parser.push(el.querySelector('.goods-tile__heading').getAttribute('href') + 'comments');
        });
        
        if (page < 30) {
            pages_parser.push(URL + `page=${page++}/`);
        }
        
        callback();
    });
}, 10); // запускаем 10 параллельных потоков

pages_parser.drain = function(){
    fs.writeFileSync('./data-pages.json', JSON.stringify(results_pages, null, 4));
}

pages_parser.push(URL);