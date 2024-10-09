const jwt = require("jsonwebtoken");

module.exports = (req,res,next) => {

    try 
    {
        //RÉCUPÉRATION DU TOKEN
        const token = req.headers.authorization.split(" ")[1];

        //DÉCODAGE DU TOKEN
        const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");

        //RÉCUPÉRATION DE L'USER ID
        const userId = decodedToken.userId;

        //AJOUT À L'OBJET REQUEST QUI EST TRANSMIS AUX ROUTES PAR LA SUITE
        req.auth = {
            userId: userId,
        }

        next();
    } 
    catch(error)
    {
        res.status(401).json( {error} )    
    }
}