const connectDB = require('./config/db')
const express = require('express')
const dotenv = require('dotenv')
const authRoutes = require('./routes/aut')

dotenv.config()

connectDB()


const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())
app.use('/api/auth', authRoutes)

app.get('/health', (req, res) => {
    res.status(200).json( { status: 'ok' })
})


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})