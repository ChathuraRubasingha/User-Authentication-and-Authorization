const pool = require('../utils/database')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
require('dotenv').config();

exports.createUser = (req, res) => {
  const { username, email, password } = req.body;

  // Generate a salt to use for hashing
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      console.error('Error generating salt:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Hash the password using the generated salt
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          console.error('Error hashing password:', err);
          res.status(500).json({ error: 'Internal server error' });
        } else {
          // Insert data into the user table with the hashed password
          const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
          pool.query(query, [username, email, hash], (err, result) => {
            if (err) {
              console.error('Error inserting user:', err);
              res.status(500).json({ error: 'Failed to create user' });
            } else {
              console.log('User created successfully');
              res.status(201).json({ message: 'User created' });
            }
          });
        }
      });
    }
  });
};

exports.loginUser = (req, res) => {
    const { email, password } = req.body;
    const secretKey = process.env.SECRET_KEY;
  
    // Retrieve the user from the database based on the provided email
    const query = 'SELECT * FROM users WHERE email = ?';
    pool.query(query, [email], (err, results) => {
      if (err) {
        console.error('Error retrieving user:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        if (results.length === 0) {
          // User not found with the provided email
          res.status(404).json({ error: 'User not found' });
        } else {
          const user = results[0];
          // Compare the provided password with the stored hashed password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
              console.error('Error comparing passwords:', err);
              res.status(500).json({ error: 'Internal server error' });
            } else {
              if (isMatch) {
                // Passwords match, login successful
                const payload = {
                  user : {
                    id: user.id, // Include any relevant user data in the payload
                  },
                };
                // Sign the token with a secret key and set its expiration time
                jwt.sign(
                  payload, secretKey , {expiresIn : '1h'}, (err, token)=>{
                    if(err){
                      console.error('Error generating JWT:', err);
                      res.status(500).json({error: "Internal server error"});
                    }else{
                      // Send the generated token to the client
                      res.status(200).json({ token });
                    }
                  }
                );
              } else {
                // Passwords do not match
                res.status(401).json({ error: 'Invalid password' });
              }
            }
          });
        }
      }
    });
  };
  