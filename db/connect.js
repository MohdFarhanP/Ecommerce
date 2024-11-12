const mongoose = require('mongoose');


// for connecting the mongodb server
const connectDb = async () => {
    try {
        const mongodb = await mongoose.connect(process.env.MONGO_URI);
        console.log("connected", mongodb.connection.host);
    } catch (error) {
        console.log("mongodb connecting error", error);
    }
}

module.exports = connectDb
