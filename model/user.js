const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/practise')

const userSchema = new mongoose.Schema({
    title: { type: String, required: true }, 
    details: String 
});


module.exports = mongoose.model('User ', userSchema);