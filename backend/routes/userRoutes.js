const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Inscription
router.post('/signup', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      password: hashedPassword,
      email: req.body.email
    });
    console.log(user);
    await user.save();
    res.status(201).send('Utilisateur créé !');
  } catch (error) {
    console.log(error);
    res.status(500).send('Erreur lors de la création de l’utilisateur.');
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    // Trouver l'utilisateur par l'email
    const user = await User.findOne({ email: req.body.email });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
      // Créer un token JWT
      const token = jwt.sign({ id: user._id }, 'secret', { expiresIn: '1h' });
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
