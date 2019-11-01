let mongoose = require('mongoose');

let AuthorSchema = new mongoose.Schema({
        name: String,
        keyword1: String,
        keyword2: String,
        numofbooks: Number,
        numofcollected:{type: Number, default: 0}

    },
    { collection: 'author' });

module.exports = mongoose.model('Author', AuthorSchema);