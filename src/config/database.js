const mongoose = require("mongoose")
const config = require("./config");

async function connectToDB() {
    try{
        await mongoose.connect(config.MONGO_URI)

        console.log("Connected to DB")
    }
    catch(err){
        console.log(err)
    }
}

module.exports = connectToDB;