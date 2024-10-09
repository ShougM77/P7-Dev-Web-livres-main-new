// import du modèle
const User = require("../models/User");

// import de bcrypt
const bcrypt = require("bcrypt");

// import de jsonwebtoken
const jwt = require("jsonwebtoken");

// enregistrement utilisateur
exports.createUser = (req, res, next) => {
    // suppression du champ id
    delete req.body.id;

    // hachage du mot de passe
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        // création utilisateur
        const user = new User({
            email: req.body.email,
            password: hash
        });

        user.save()
        .then(() => res.status(201).json({ message: "Utilisateur enregistré" }))
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

// connexion utilisateur
exports.logUser = (req, res, next) => {
    User.findOne({ email: req.body.email })
    .then(user => {
        if (!user) {
            return res.status(401).json({ message: "Identifiants incorrects" });
        }
        // vérification du mot de passe
        bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            if (!valid) {
                return res.status(401).json({ message: "Identifiants incorrects" });
            }
            // connexion réussie
            res.status(200).json({
                userId: user._id,
                token: jwt.sign(
                    { userId: user._id },
                    "RANDOM_TOKEN_SECRET",
                    { expiresIn: "24h" }
                )
            });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};
