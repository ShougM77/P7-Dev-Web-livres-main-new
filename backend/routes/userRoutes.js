const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Inscription
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email et mot de passe requis.');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ password: hashedPassword, email });

    await user.save();
    res.status(201).send('Utilisateur créé !');
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).send('Email déjà utilisé.');
    }
    console.log(error);
    res.status(500).send('Erreur lors de la création de l’utilisateur.');
  }
});

// Connexion
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email et mot de passe requis.');
  }

  try {
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { userId: user._id }, // Utilisation de userId pour correspondre au middleware
        process.env.JWT_SECRET_KEY // Clé secrète pour le token
      );
      res.json({ token });
    } else {
      res.status(401).send('Identifiants incorrects.');
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Erreur lors de la connexion.');
  }
});

module.exports = router;
