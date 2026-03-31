const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

const MONGOURL = process.env.MONGO_URL

const connectDB = async () => {
    try {

        const conn = await mongoose.connect(MONGOURL)
        console.log(`MongoDB Connected: ${conn.connection.host}`)

    } catch (error) {
        console.log(`Connection failed ${error.message}`)
        process.exit(1)
    }
}

module.exports = connectDB