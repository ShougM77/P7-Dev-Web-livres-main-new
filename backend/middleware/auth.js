const jwt = require('jsonwebtoken');

// Utilisation de la clé secrète JWT depuis la variable d'environnement
const tokenKey = process.env.JWT_SECRET_KEY;

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1]; // Récupérer le token après "Bearer "
    if (!token) {
      return res.status(401).json({ error: 'Token mal formaté' });
    }

    const decodedToken = jwt.verify(token, tokenKey); // Vérification avec la clé secrète
    req.auth = { userId: decodedToken.userId }; // Ajouter l'userId décodé à l'objet req

    next(); // Passer au middleware suivant
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Le token a expiré' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Signature du token invalide' });
    }
    return res.status(401).json({ error: 'Requête non authentifiée' });
  }
};
