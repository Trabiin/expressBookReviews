const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{ username: "test", password: "test123" }];

const isValid = (username)=>{ //returns boolean
    let userswithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userswithsamename.length > 0){
      return true;
    } else {
      return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
      });
      if(validusers.length > 0){
        return true;
      } else {
        return false;
      }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
  
    if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 });
  
      req.session.authorization = {
        accessToken,username
    }
    return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const sessionData = req.session.authorization;

    if (!sessionData || !sessionData.username) {
        return res.status(401).send("Unauthorized. Please log in.");
    }

    const username = sessionData.username;
    const reviewText = req.body.review;

    // Check if the book exists
    if (!books[isbn]) {
        books[isbn] = { author: "Unknown", title: "Unknown", reviews: [] }; // Initialize an empty reviews array for the ISBN if it doesn't exist
    }

    // Ensure that books[isbn].reviews is an array
    if (!Array.isArray(books[isbn].reviews)) {
        books[isbn].reviews = [];
    }

    // Check if the user has already posted a review for this ISBN
    let reviewExists = false;

    for (let i = 0; i < books[isbn].reviews.length; i++) {
        if (books[isbn].reviews[i].username === username) {
            // If the user has already posted a review, modify the existing one
            books[isbn].reviews[i].review = reviewText;
            reviewExists = true;
            break;
        }
    }

    if (!reviewExists) {
        // If the user hasn't posted a review, add a new one
        const newReview = {
            username: username,
            review: reviewText,
        };

        books[isbn].reviews.push(newReview);
    }

    res.send(`Review added/updated for ISBN ${isbn}.`);
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const review = req.params.review;
    const isbn = req.params.isbn;
    const user = req.session.authorization.username;
    
    if (review){
        delete books[review]
    }
    res.send(`Review for the ISBN ${isbn} posted by the user ${user} deleted.`);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
