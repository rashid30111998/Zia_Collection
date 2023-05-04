const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema =new Schema({
    name :{
        type: String,
        required: true
    },
    email :{
        type: String,
        required: true
    },
    mobile :{
        type: String,
        required: true
    },
    password :{
        type: String,
        required: true
    },
    status:{
        type: Boolean,
        required:true
    },
    isActive:{
        type: Boolean,
        required:true
    }
},
{
    timestamps:true
});


module.exports = mongoose.model('User', userSchema);