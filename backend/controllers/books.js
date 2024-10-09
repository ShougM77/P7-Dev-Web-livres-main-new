// importation du modèle
const Book = require("../models/Book"); 

// importation de la bibliothèque fs
const fs = require("fs");

// récupérer tous les livres
exports.getAllBooks = async (req, res, next) => {
    try {
        const books = await Book.find();

        if (!books || books.length === 0) {
            return res.status(404).json({ message: "Aucun livre trouvé" });
        }

        return res.status(200).json(books);
    } catch (error) {
        return res.status(400).json({ error });
    }
};

// récupérer un livre par son id
exports.getBook = async (req, res, next) => {
    try {
        const book = await Book.findOne({ _id: req.params.id });

        if (!book) {
            return res.status(404).json({ message: "Livre non trouvé" });
        }

        return res.status(200).json(book);
    } catch (error) {
        return res.status(404).json({ error });
    }
};

// récupérer les trois livres les mieux notés
exports.getBestThree = async (req, res, next) => {
    try {
        const books = await Book.find();

        if (!books || books.length === 0) {
            return res.status(404).json(new Error("Aucun livre trouvé"));
        }

        const topThreeBooks = books
            .sort((a, b) => b.averageRating - a.averageRating)
            .slice(0, 3);

        return res.status(200).json(topThreeBooks);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

// enregistrer un nouveau livre
exports.createBook = async (req, res, next) => {
    // convertir la chaîne de caractères en objet json
    const bookObject = JSON.parse(req.body.book);

    // supprimer l'id automatique de mongo db du corps de la requête
    delete bookObject._id;
    delete bookObject.userId; // supprimer l'id utilisateur pour des raisons de sécurité

    // créer une nouvelle instance de livre
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
    });

    try {
        await book.save();
        return res.status(201).json({ message: "Livre enregistré" });
    } catch (error) {
        return res.status(400).json({ error });
    }
};

// mettre à jour un livre existant
exports.updateBook = async (req, res, next) => {
    const bookObject = req.file
        ? {
              ...JSON.parse(req.body.book),
              imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
          }
        : { ...req.body };

    // supprimer l'id utilisateur pour des raisons de sécurité
    delete bookObject.userId;

    try {
        const book = await Book.findOne({ _id: req.params.id });

        if (!book) {
            return res.status(404).json({ message: "Livre non trouvé" });
        }

        if (book.userId !== req.auth.userId) {
            return res.status(403).json({ message: "Non autorisé" });
        }

        // si nouvelle image fournie
        if (req.file) {
            // supprimer l'ancienne image
            const filename = book.imageUrl.split("/images/")[1];

            fs.unlink(`images/${filename}`, async (err) => {
                if (err) {
                    return res.status(500).json({ error: "Erreur lors de la suppression de l'image" });
                }

                bookObject.imageUrl = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;

                try {
                    await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });
                    return res.status(200).json({ message: "Livre modifié" });
                } catch (error) {
                    return res.status(500).json({ error });
                }
            });
        } else {
            try {
                await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });
                return res.status(200).json({ message: "Livre modifié" });
            } catch (error) {
                return res.status(500).json({ error });
            }
        }
    } catch (error) {
        return res.status(400).json({ error });
    }
};

// supprimer un livre
exports.deleteBook = async (req, res, next) => {
    try {
        const book = await Book.findOne({ _id: req.params.id });

        if (!book) {
            return res.status(404).json({ message: "Livre non trouvé" });
        }

        if (book.userId !== req.auth.userId) {
            return res.status(403).json({ message: "Non autorisé" });
        }

        // récupérer l'image pour la supprimer
        const filename = book.imageUrl.split("/images/")[1];

        fs.unlink(`images/${filename}`, async (err) => {
            if (err) {
                return res.status(500).json({ error: "Erreur lors de la suppression de l'image" });
            }

            try {
                await Book.deleteOne({ _id: req.params.id });
                return res.status(200).json({ message: "Livre supprimé" });
            } catch (error) {
                return res.status(400).json({ error });
            }
        });
    } catch (error) {
        return res.status(400).json({ error });
    }
};

// noter un livre
exports.rateBook = async (req, res, next) => {
    const updateRating = {
        userId: req.auth.userId,
        grade: req.body.rating,
    };

    try {
        const book = await Book.findOne({ _id: req.params.id });

        // livre introuvable
        if (!book) {
            return res.status(404).json(new Error("Impossible de trouver le livre"));
        }

        // le livre a déjà été noté
        if (book.ratings.find((rating) => rating.userId === req.auth.userId)) {
            return res.status(400).json(new Error("Vous avez déjà noté ce livre"));
        }

        // vérification de la note (0-5)
        if (updateRating.grade < 0 || updateRating.grade > 5) {
            return res.status(400).json(new Error("La note doit être comprise entre 0 et 5"));
        } else if (typeof updateRating.grade !== "number") {
            return res.status(400).json(new Error("La note doit être un chiffre"));
        }

        // ajouter la notation et calculer la nouvelle moyenne
        book.ratings.push(updateRating);
        const sumRatings = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);
        book.averageRating = sumRatings / book.ratings.length;

        try {
            const bookUpdated = await book.save();
            return res.status(200).json(bookUpdated);
        } catch (error) {
            return res.status(500).json({ error });
        }
    } catch (error) {
        return res.status(500).json({ error });
    }
};

