const mongoose = require('mongoose');

const connectDb = async ()=>{
    try{
    const mongodb = await mongoose.connect(process.env.MONGO_URI);
    console.log("connected",mongodb.connection.host);
    }catch(error){
        console.log("mongodb connecting error",error);
    }
}

module.exports = connectDb
