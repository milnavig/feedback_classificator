const fs = require('fs');
const LanguageDetect = require('languagedetect');
const lngDetector = new LanguageDetect();
const { convert } = require('html-to-text');
const stopwords = require('./stopwords'); // array of stopwords

let data_arr = [];
let ukrainian_reviews = [];
let russian_reviews = [];
let tokenization_arr = [];

fs.readFile('./data-reviews.json', 'utf8' , (err, data) => {
    if (err) {
        console.error(err)
        return
    }
    
    data_arr = JSON.parse(data);
    
    data_arr.forEach((comment) => {
        comment.comment = convert(comment.comment, {
            wordwrap: false
        });
        comment.comment = comment.comment.toLowerCase();
        
        if (lngDetector.detect(comment.comment).length !== 0 && lngDetector.detect(comment.comment)[0][0] === 'ukrainian') {
            ukrainian_reviews.push(comment)
        } else if (lngDetector.detect(comment.comment).length !== 0 && lngDetector.detect(comment.comment)[0][0] === 'russian') {
            russian_reviews.push(comment)
        } else {
            
        }
    });
    
    ukrainian_reviews = ukrainian_reviews.map(el => {
        return {...el, comment: el.comment.replace(/\.|,|\(|\)|:|[0-9]|\r\n|\n|\r|\?|\!|\-|\"/g, '')}
    });
    
    ukrainian_reviews.forEach((review) => {
        let arr = review.comment.split(' ');
        arr = arr.filter(el => el.length !== 0);
        arr = arr.filter(el => !stopwords.includes(el));
        tokenization_arr.push({rating: review.rating > 4 ? 1 : 0, tokens: arr});
    })
    
    fs.writeFileSync('./cleaned-text.json', JSON.stringify(tokenization_arr, null, 4));
});
