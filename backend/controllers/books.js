//IMPORTATION MODEL
const Book = require("../models/Book"); 

//IMPORTATION DE FS
const fs = require("fs");

/* MÉTHODES */

    //RÉCUPÉRATION DE TOUS LES LIVRES
    exports.getAllBooks = async (req, res, next) => {
        
        try 
        {
            const books = await Book.find();
        
            if(!books || books.length === 0) 
            {
                return res.status(404).json({ message: "Aucun livre trouvé" });
            }
            
            return res.status(200).json(books);
        } 
        catch(error)
        {
            return res.status(400).json({ error });
        }
    };

    //RÉCUPÉRATION D'UN LIVRE
    exports.getBook = async (req, res, next) => {

        try 
        {
            const book = await Book.findOne({_id : req.params.id});

            if(!book) 
                {
                return res.status(404).json({ message: "Livre non trouvé" });
            }

            return res.status(200).json(book);
        } 
        catch(error) 
        {
            return res.status(404).json({ error });
        }
    };

    //RÉCUPÉRATION DES TROIS LIVRES LES MIEUX NOTÉS
    exports.getBestThree = async (req, res, next) => {
        
        const books = await Book.find();
        
        try 
        {
            if(!books || books.length === 0)
            {
                return res.status(404).json(new Error("Aucun livre trouvé"));
            }

            const topThreeBooks = books.sort( (a,b) => b.averageRating - a.averageRating ).slice(0,3);
        
            return res.status(200).json(topThreeBooks);
        } 
        catch(error) 
        {
            return res.status(500).json( {error} );
        }
    };
       
    //ENREGISTREMENT D'UN LIVRE
    exports.createBook = async (req, res, next) => {  
            
        //TRANSFORMATION DE LA CHAINE DE CARACTÈRES EN JSON
        const bookObject = JSON.parse(req.body.book);

        ////SUPPRESSION DU CHAMP ID AUTOMATIQUE DE MONGO DB DU CORPS DE LA REQUÊTE
        delete bookObject._id;

        //SUPPRESSION DU CHAMP ID UTILISATEUR PAR MESURE DE SÉCURITÉ
        delete bookObject.userId;

        //CRÉATION D'UNE INSTANCE DE BOOK
        const book = new Book( 
        { 
            ...bookObject, 
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
        })

        try 
        {
            await book.save();

            return res.status(201).json( {message: "Livre enregistré"} );
        } 
        catch(error) 
        {
            return res.status(400).json( {error} );   
        }
    };

    // MISE À JOUR D'UN LIVRE
    exports.updateBook = async (req, res, next) => {

        const bookObject = req.file ? {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
        } : { ...req.body };

        //SUPPRESSION DU CHAMP ID UTILISATEUR PAR MESURE DE SÉCURITÉ
        delete bookObject.userId;

        try 
        {
            const book = await Book.findOne({ _id: req.params.id });

            if(!book) 
            {
                return res.status(404).json({ message: "Livre non trouvé" });
            }

            if(book.userId !== req.auth.userId) 
            {
                return res.status(403).json({ message: "Non autorisé" });
            }

            //SI NOUVELLE IMAGE
            if(req.file)
            {
                // SUPPRESSION DE L'ANCIENNE
                const filename = book.imageUrl.split('/images/')[1];
                
                fs.unlink(`images/${filename}`, async (err) => {
                    
                    if(err) 
                    {
                        return res.status(500).json({ error: "Erreur lors de la suppression de l'image" });
                    }

                    bookObject.imageUrl = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;

                    try 
                    {
                        await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });

                        return res.status(200).json({ message: "Livre modifié" });
                    } 
                    catch(error) 
                    {
                        return res.status(500).json({ error });
                    }
                });
            } 
            else 
            {
                try
                {
                    await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });
                    
                    return res.status(200).json({ message: "Livre modifié" });
                } 
                catch(error) 
                {
                    return res.status(500).json({ error });
                }
            }
        } 
        catch(error) 
        {
            return res.status(400).json({ error });
        }
    };

    //SUPPRESSION D'UN LIVRE
    exports.deleteBook = async (req, res, next) => {
        
        try 
        {
            const book = await Book.findOne({_id : req.params.id});

            if(!book)
            {
                return res.status(404).json({ message: "Livre non trouvé" });
            }
            
            if(book.userId !== req.auth.userId)
            {
                return res.status(403).json({ message: 'Non-autorisé'});
            }

            //RÉCUPÉRATION DE L'IMAGE POUR LA SUPPRESSION
            const filename = book.imageUrl.split('/images/')[1];

            fs.unlink(`images/${filename}`,async (err) => {

                if(err)
                {
                    return res.status(500).json({ error: "Erreur lors de la suppression de l'image" });
                }

                try 
                {
                    await Book.deleteOne( {_id : req.params.id} );

                    return res.status(200).json( {message: "Livre supprimé"} );
                } 
                catch(error) 
                {
                    return res.status(400).json( {error} );   
                }
            })

        } 
        catch(error) 
        {
            return res.status(400).json({ error });
        }
    };

    //NOTATION D'UN LIVRE
    exports.rateBook = async (req, res, next) => {

        const updateRating = {userId: req.auth.userId, grade: req.body.rating};
            
        try
        {
            const book = await Book.findOne( {_id : req.params.id} );

            //LE LIVRE EST INTROUVABLE
            if(!book)
            {                    
                return res.status(404).json( new Error("Impossible de trouver le livre") );
            }
            //LE LIVRE EXISTE
            else
            {
                //LE LIVRE A DÉJÀ ÉTÉ NOTÉ
                if(book.ratings.find( rating => rating.userId === req.auth.userId ))
                {
                    return res.status(400).json( new Error("Vous avez déjà noté le livre") )
                }

                //VÉRIFICATION QUE LA NOTE EST COMPRISE ENTRE 0 ET 5 (INCLUS)
                if(updateRating.grade < 0 || updateRating.grade > 5)
                {
                    return res.status(400).json( new Error("La note doit être comprise entre 0 et 5") )
                }  
                else if(typeof updateRating.grade !== 'number')
                {
                    return res.status(400).json( new Error("La note doit être un chiffre") )
                }
                //LA NOTE EST VALABLE
                else
                {
                    //ON AJOUTE LA NOTATION DU LIVRE
                    book.ratings.push(updateRating);

                    //ON CALCULE LA SOMMES DES NOTES DU LIVRE
                    const sumRatings = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);

                    //ON CALCULE LA NOUVELLE MOYENNE DU LIVRE
                    book.averageRating = sumRatings / book.ratings.length;
        
                    try
                    {
                        const bookUpdated = await book.save();
                        
                        return res.status(200).json( bookUpdated );
                    } 
                    catch(error) 
                    {
                        return res.status(500).json( {error} );
                    }
                }
            }
        } 
        catch(error) 
        {
            return res.status(500).json( {error} );
        }
    };

/* FIN MÉTHODES */