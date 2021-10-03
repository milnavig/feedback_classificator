const fs = require('fs');
const express = require('express');
const PORT = 5000;

const app = express();

app.use(express.static('public'));
app.use(express.json());

app.post('/', function(req, res) {
    let data = req.body;
    let decision = assessment(data.review);

    res.status(200).json({
        ...decision
    });
});

function assessment(review) {
    let data;
    try {
        data = fs.readFileSync('./tokens.json', 'utf8');
    } catch(err) {
        tokenize();
    }
    
    tokens = JSON.parse(data);
        
    let test_comment = "Запускається на максимальних налаштуваннях графіки. Нічого не глючить. Рекомендую!";
    review = review.replace(/\.|,|\(|\)|:|[0-9]|\r\n|\n|\r|\?|\!|\-|\"/g, '').toLowerCase().split(' ');

    let p_pos = tokens.number_of_pos_words / (tokens.number_of_pos_words + tokens.number_of_neg_words);
    let p_neg = tokens.number_of_neg_words / (tokens.number_of_pos_words + tokens.number_of_neg_words);

    let comment_pos = review.reduce((res, el) => {
        if (tokens[el]) {
            console.log('pos_word ', tokens[el])
            return res * (tokens[el].pos / tokens.number_of_pos_words);
        }
        return res;
    }, 1);

    let comment_neg = review.reduce((res, el) => {
        if (tokens[el]) {
            console.log('neg_word ', tokens[el])
            return res * (tokens[el].neg / tokens.number_of_neg_words);
        }
        return res;
    }, 1);
    
    console.log(comment_neg)
    console.log(comment_pos)

    /*
    let comment_pos = 1;
    test_comment.forEach(el => {
        if (tokens[el]) {
            //comment_pos = comment_pos * (tokens[el].pos / number_of_pos_words);
            console.log(tokens[el])
            comment_pos = comment_pos * ((tokens[el].pos + 1) / (number_of_pos_words + 2));
        } else comment_pos = comment_pos * (1 / (number_of_pos_words + 2));
    });

    let comment_neg = 1;
    test_comment.forEach(el => {
        if (tokens[el]) {
            comment_neg = comment_neg * ((tokens[el].neg + 1) / (number_of_neg_words + 2));
        } else comment_neg = comment_neg * (1 / (number_of_neg_words + 2));
    });
    */
    
    let decision = comment_pos * p_pos > comment_neg * p_neg ? 'Positive comment' : 'Negative comment';
    return { decision, comment_pos, comment_neg, p_pos, p_neg };
}

let data_arr;
let tokens = {};

let number_of_pos_words = 0;
let number_of_neg_words = 0;

function tokenize() {
    fs.readFile('./cleaned-text.json', 'utf8' , (err, data) => {
        if (err) {
            console.error(err)
            return
        }

        data_arr = JSON.parse(data);

        data_arr.forEach(el => {
            el.tokens.forEach(t => {
                tokens[t] = tokens[t] ? el.rating !== 0 ? { ...tokens[t], pos: ++tokens[t].pos } : { ...tokens[t], neg: ++tokens[t].neg } : el.rating !== 0 ? { neg: 0, pos: 1 } : { neg: 1, pos: 0 };

                if (el.rating !== 0) number_of_pos_words++;
                else number_of_neg_words++;
            });
        });
        
        tokens.number_of_pos_words = number_of_pos_words;
        tokens.number_of_neg_words = number_of_neg_words;

        fs.writeFileSync('./tokens.json', JSON.stringify(tokens, null, 4));
        

        //console.log(tokens)
        //fs.writeFileSync('./cleaned-text.json', JSON.stringify(tokenization_arr, null, 4));
    });
}


app.listen(PORT, () => console.log('Hello!'));