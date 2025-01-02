const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');  
const router = express.Router();
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.secret;


//email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "firasyazid4@gmail.com",
    pass: "cntnhhvujdsfzhig",
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Email server is ready to take our messages");
  }
});



///register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'all fields are required' });
  }

   if (password.length < 8) {
    return res.status(400).json({ message: 'password must contains 8 characters ' });
  }

  try {
     const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'email or username exists' });
    }

     const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

     const newUser = new User({
      username,
      email,
      passwordHash,
    });

    await newUser.save();

     const mailOptions = {
      from: "firasyazid4@gmail.com",
      to: email,
      subject: "Bienvenue sur notre plateforme ",
      text: `Bonjour ${username},\n\nBienvenue sur notre plateforme ! Nous sommes ravis de vous accueillir parmi nous.\n\nCordialement,\nL'équipe`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(201).json({ message: 'Registered successfully', user: newUser  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



// login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

     if (!email || !password) {
        return res.status(400).json({ message: 'fields are required' });
    }

    try {
         const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'not found' });
        }

         const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

         const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, {
            expiresIn: '3h',
        });

        res.status(200).json({ message: 'successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
