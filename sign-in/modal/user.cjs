const mongoose = require('mongoose')

mongoose.connect(`mongodb://localhost:27017/signin`)

const userSchema = mongoose.Schema({
    name:{type : String,
        required : true,
    },
    contact : {
        type : Number,
        required :true
    },
    email :{
        type : String,
        required : true,
    },
    password : {
        type : String,
        required : true
    }
})

module.exports = mongoose.model("user",userSchema);