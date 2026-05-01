const errorHandler = (err, req, res, next) => {
    console.error(err.stack)

    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message)
        return res.status(400).json({ errors: messages })
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0]
        return res.status(400).json({ error: `${field} already exists` })
    }

    return res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
}

module.exports = errorHandler
