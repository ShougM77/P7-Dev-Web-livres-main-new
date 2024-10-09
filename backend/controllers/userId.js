//IMPORTATION MODEL
const User = require("../models/User");

//IMPORTATION BCRYPT
const bcrypt = require("bcrypt");

//IMPORTATION DE JSONWEBTOKEN
const jwt = require("jsonwebtoken");

/* MÉTHODES */

    //ENREGISTREMENT D'UN UTILISATEUR
    exports.createUser = (req, res, next) => {

        //SUPPRESSION DU CHAMP ID AUTOMATIQUE DE MONGO DB DU CORPS DE LA REQUÊTE
        delete req.body.id;

        //HACHAGE DU MOT DE PASSE
        bcrypt.hash(req.body.password, 10)
        .then(
            hash => {
                //CRÉATION D'UNE INSTANCE UTILISATEUR
                const user = new User({
                    email: req.body.email,
                    password: hash
                });

                user.save()
                .then( () => res.status(201).json( { message: "Utilisateur enregistré"} ))
                .catch( error => res.status(500).json( {error} ))
            }
        )
        .catch( error => res.status(500).json( {error} ))
    }

    //CONNEXION D'UN UTILISATEUR
    exports.logUser = (req, res, next) => {
            
        User.findOne( {email: req.body.email} )
        .then(             
            user => {

                if(user === null)
                {
                    res.status(401).json({message: "Paire identifiant/mot de passe incorrecte"})
                }
                //UTILISATEUR ENREGISTRÉ DANS LA BDD
                else
                {
                    //RÉCUPÉRATION DU HASH
                    bcrypt.compare(req.body.password, user.password)
                    .then(
                        valide => {
                            
                            if(!valide)
                            {
                                res.status(401).json( {message: "Paire identifiant/mot de passe incorrecte"} );
                            }
                            //LE MOT DE PASSE EST CORRECT
                            else
                            {
                                res.status(200).json( 
                                    { 
                                        userId: user._id, 
                                        token: jwt.sign( 
                                            {userId: user._id},  
                                            "RANDOM_TOKEN_SECRET",
                                            { expiresIn: "24h" }
                                        ) 
                                    }
                                )
                            }
                        }                        
                    )
                    .catch( error => res.status(500).json( {error} ))
                }
            }
        )
        .catch( error => res.status(500).json( {error} ))

    }

/* FIN MÉTHODES */