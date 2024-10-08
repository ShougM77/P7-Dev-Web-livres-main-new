const jwt = require('jsonwebtoken');

const userIdMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Extraire le token de l'en-tête Authorization

    if (!token) {
      return res.status(401).json({ message: 'Token non fourni.' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.auth = { userId: decodedToken.userId }; // Ajouter userId à req.auth
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide.' });
  }
};

module.exports = userIdMiddleware;
