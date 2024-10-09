const mongoose = require("mongoose");

const bookSchema = mongoose.Schema({
    userId: { type: String, required: true },   
    title: { type: String, required: true },   
    author: { type: String, required: true },  
    imageUrl: { type: String, required: true }, 
    year: { type: Number, required: true },     
    genre: { type: String, required: true },   
    ratings: [                                   // tableau de notes du livre
        {
            userId: { type: String, required: true },  // id utilisateur qui a noté
            grade: { type: Number, required: true }    // note donnée par l'utilisateur
        }
    ],
    averageRating: { type: Number, required: true }  // note moyenne du livre
});

module.exports = mongoose.model('Book', bookSchema);
