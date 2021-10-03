# Feedback classificator

This app crawls user feedbacks from Rozetka for any category and uses Bag-of-Words Model to represent text data. I applied a Naive Bayes algorithm with Laplace smoothing to classify feedbacks as positive and negative.

## Structure of the project

The 'web-scraping' folder consists of the Node.js app for scraping reviews from Rozetka Online shop.
The 'text-cleaning' folder includes the Node.js app for text cleaning. It removes punctuation and stopwords.
The 'nba' folder includes the Node.js app for feedback's classification using Naive Bayes algorithm.