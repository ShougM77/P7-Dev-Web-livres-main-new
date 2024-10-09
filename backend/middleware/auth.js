const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        // récupération du token
        const token = req.headers.authorization.split(" ")[1];

        // décodage du token
        const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");

        // récupération de l'userId
        const userId = decodedToken.userId;

        // ajout à l'objet req
        req.auth = {
            userId: userId,
        };

        next();
    } 
    catch (error) {
        res.status(401).json({ error });
    }
};
