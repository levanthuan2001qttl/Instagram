const { json } = require('express')
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin = require('../middleware/requireLogin')
const Post = mongoose.model('Post')


router.get('/allpost',requireLogin,(req, res) => {
    Post.find() 
        .populate("postedBy", "_id name")
        .populate("comments.postedBy", "_id name")
        .then(posts => {
            res.json({posts: posts})
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/getsubpost',requireLogin,(req, res) => {
    Post.find({postedBy:{$in:req.user.following}}) 
        .populate("postedBy", "_id name")
        .populate("comments.postedBy", "_id name")
        .then(posts => {
            res.json({posts: posts})
        })
        .catch(err => {
            console.log(err)
        })
})



router.post('/createpost',requireLogin, (req, res) => {
    const {title, body, pic} = req.body
    if(!title || !body || !pic ) {
        res.status(422).json({error: 'Pleases add all the fields'})
    }
    req.user.password = undefined
    const post = new Post({
        title,
        body,
        photo:pic,
        postedBy: req.user
    })
    post.save() 
        .then(posted => {
            res.json({post: posted})
        })
        .catch(err => {
            console.log(err)
        })
    
})


router.get('/mypost',requireLogin, (req, res) => {
    Post.find({postedBy: req.user._id})
        .populate("postedBy", "_id name")
        .then(mypost => {
            res.json({mypost})
        })
        .catch(err => {
            console.log(err)
        })
})


router.put('/like', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {$push: {likes:req.user._id}}, {new: true} )
    .populate('postedBy', 'name _id')
    .populate("comments.postedBy", "name _id")
    .exec((err, result) => {
        if(err) {
            return res.status(442).json({error:err})
        } else {
            res.json(result)
        }
    }) 
})    


router.put('/unlike', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {$pull: {likes:req.user._id}}, {new: true} )
    .populate('postedBy', 'name _id')
    .populate("comments.postedBy", "name _id")
    .exec((err, result) => {
        if(err) {
            return res.status(442).json({error:err})
        } else {
            res.json(result)
        }
    }) 

}) 


router.put('/comment', requireLogin, (req, res) => {

    const comment = {
        text: req.body.text,
        postedBy: req.user._id
    }

    Post.findByIdAndUpdate(req.body.postId, {$push: {comments:comment}}, {new: true} )
    .populate('postedBy', '_id name')
    .populate("comments.postedBy", "_id name")
    
    .exec((err, result) => {
        if(err) {
            return res.status(442).json({error:err})
        } else {
            res.json(result)
        }
    }) 
})    


router.delete('/deletepost/:postId', requireLogin, (req, res) => {
    Post.findOne({_id:req.params.postId})
        .populate("postedBy", "_id")
        .exec((err, post) => {
            if(err || !post) {
                return res.status(442).json({error: err})
            }
            if(post.postedBy._id.toString() === req.user._id.toString()) {
                post.remove()
                    .then(result => {
                        res.json(result)
                    })
                    .catch(err => {
                        console.log(err)
                    })
            } 
        }) 
})

router.delete('/deletecomment/:postId/:commentId', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.params.postId, { $pull: { comments: req.params.commentId },}, {new: true} )
    .populate('postedBy', '_id name')
    .populate("comments.postedBy", "_id")
    
    .exec((err, result) => {
        if(err) {
            return res.status(442).json({error:err})
        } else {
            res.json("successfully")
        }
    }) 
})




module.exports = router