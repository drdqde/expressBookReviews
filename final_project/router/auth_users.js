const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    {
        "username": "itsme",
        "password": "hardtocrack"
    }
];

const isValid = (username) => { //returns boolean
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}


const authenticatedUser = (username, password) => {
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    //Write your code here
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn
    // Check whether book exists
    if (!Object.keys(books).includes(isbn)) {
        return res.status(404).json({ message: `No book found for ISBN ${isbn}.` })
    }
    const review = req.body.review;
    const username = req.session.authorization.username

    //Check whether there is a book for this ISBN
    if (books[isbn].reviews[username]) {
        books[isbn].reviews[username] = review;
        //res.json('Your review has been updated for the book with ISBN ' + isbn + ':'+ `${book}`);
        return res.status(200).json({ message: `Your review has been updated for the book with ISBN ${isbn}.` });
    }

    // If the user didn't post a review for this book, add a new review
    books[isbn].reviews[username] = review;
    //res.send('Your review has been posted for the book with ISBN ' + isbn + ':'+ `${book}`);
    return res.status(200).json({ message: `Your review has been posted for the book with ISBN ${isbn}.` });
});


// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn
    // Check whether book exists
    if (!Object.keys(books).includes(isbn)) {
        return res.status(404).json({ message: `No book found for ISBN ${isbn}.` })
    }
    const username = req.session.authorization.username


    if (!books[isbn]) {
        return res.status(404).send(`No book found for ISBN ${isbn}.`);
    }

    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: `No book review for user ${username} found for book with ISBN ${isbn}.` })
    }

    delete books[isbn].reviews[username];
    return res.status(200).json(`Review of user ${username} has been deleted for the book with ISBN ${isbn}.`);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

