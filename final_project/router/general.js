const express = require('express');
const axios = require('axios');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;
const books = require('./booksdb.js');
const public_users = express.Router();

const fetchBookDetails = (identifier, value) => {
    return new Promise((resolve, reject) => {
        if (identifier === 'isbn' && books[value]) {
            resolve([books[value]]);
        } else {
            const matchingBooks = Object.values(books).filter(book => book[identifier] === value);

            if (matchingBooks.length > 0) {
                resolve(matchingBooks);
            } else {
                reject(new Error(`Books with the specified ${identifier} not found`));
            }
        }
    });
};

// Task 10: Get the list of books available in the shop
public_users.get('/', (req, res) => {
    res.send(JSON.stringify(books, null, 4));
});

// Task 11: Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    fetchBookDetails('isbn', isbn)
        .then(bookDetails => res.send(bookDetails))
        .catch(error => res.status(404).json({ message: error.message }));
})

// Task 12: Get book details based on author
public_users.get('/author/:author', (req, res) => {
    const authorToFind = req.params.author;

    fetchBookDetails('author', authorToFind)
        .then(bookDetails => res.send(bookDetails))
        .catch(error => res.status(404).json({ message: error.message }));
});

// Task 13: Get book details based on title
public_users.get('/title/:title', (req, res) => {
    const titleToFind = req.params.title;

    fetchBookDetails('title', titleToFind)
        .then(bookDetails => res.send(bookDetails))
        .catch(error => res.status(404).json({ message: error.message }));
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const reviewContent = books[isbn].reviews;

    // Check if there are reviews for the book
    res.send(reviewContent);
});

module.exports.general = public_users;
