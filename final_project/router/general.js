const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    //Write your code here
    return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    let isbn = req.params.isbn
    //Check whether there is a book for this ISBN
    if (!Object.keys(books).includes(isbn)) {
        return res.status(404).json({ message: `No book found for ISBN ${isbn}.` })
    } else {
        let book_by_ISBN = books[isbn]
        return res.status(200).send(JSON.stringify(book_by_ISBN, null, 4));
    }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    let author = req.params.author;
    const books_by_author = Object.values(books).filter(book => book.author === author);
    // Check whether there are books for the author
    if (Object.keys(books_by_author).length > 0) {
        return res.status(200).send(JSON.stringify(books_by_author, null, 4));
    } else {
        return res.status(404).json({ message: `No book found for author ${author}.` })
    }

});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    let title = req.params.title;
    const books_by_title = Object.values(books).filter(book => book.title === title);
    // Check whether there are books for the title
    if (Object.keys(books_by_title).length > 0) {
        return res.status(200).send(JSON.stringify(books_by_title, null, 4));
    } else {
        return res.status(404).json({ message: `No book found for title ${title}.` })
    }

});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    let isbn = req.params.isbn
    // Check whether book exists
    if (!Object.keys(books).includes(isbn)) {
        return res.status(404).json({ message: `No book found for ISBN ${isbn}.` })
    }
    let reviews_by_ISBN = books[isbn].reviews
    //Check whether there is a book for this ISBN

    if (Object.keys(reviews_by_ISBN).length > 0) {
        return res.status(200).send(JSON.stringify(reviews_by_ISBN, null, 4));
    }
    else {
        return res.status(404).json({ message: `No reviews found for book with ISBN ${isbn}.` })
    }
});
