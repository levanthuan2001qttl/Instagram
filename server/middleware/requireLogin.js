const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../config/keys')
const mongoose = require('mongoose')
const User = mongoose.model('User')
module.exports = (req, res, next) => {
    const {authorization} = req.headers
    // authorization Bearer token
    if(!authorization) {
       return res.status(401).json({error: 'You must be logged in'})
    }
    //Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MWQ3MWM1MTA5YzY2NGYxZDNhZmVmMmYiLCJpYXQiOjE2NDE2NTY1MTN9.GLLdgdLLwqE5X0UrJM_EZoDEMPBd11zmV_MdCumswPk
    const token = authorization.replace("Bearer ", "")
    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if(err) {
            return res.status(401).json({error: 'You must be logged in'})
        }
        //console.log('payload: ',payload)
        
        const {_id} = payload
        User.findById(_id)
            .then(userData => { // req.user = info user
                req.user = userData
                next()
            }) 
           
    })

}