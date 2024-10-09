const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },    // email de l'utilisateur [unique]
    password: { type: String, required: true }                // mot de passe haché de l'utilisateur
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
