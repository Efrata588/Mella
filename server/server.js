const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoute')
const errorHandler = require('./middlewares/errorHandler')

dotenv.config()
connectDB()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }))

app.use(errorHandler)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
