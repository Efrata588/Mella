const joi = require('joi')

const investorProfileValidation = joi.object({
    investorType: joi.string().required(),

    bio: joi.string().max(200),

    industriesInterested: joi.array().items(joi.string()),
    investrmentRange: joi.object({
        min: joi.number(),
        max: joi.number()
    }),

    preferredStages: joi.array().items(joi.string()),
    linkedinurl: joi.string(),
    website: joi.string(),
    location: joi.string(),
    profileImage: joi.string(),
})


module.exports = { investorProfileValidation }