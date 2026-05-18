const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoute')
const investorRoutes = require('./routes/investorRoute')
const errorHandler = require('./middlewares/errorHandler')
const adminRoutes = require('./routes/adminRoute') 

dotenv.config()
connectDB()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/investor', investorRoutes)
app.use('/api/admin', adminRoutes)    

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }))

app.use(errorHandler)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
