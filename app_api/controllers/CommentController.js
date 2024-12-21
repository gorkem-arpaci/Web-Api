//const Venue = require('../models/venue');
var mongoose = require('mongoose');
var venue = mongoose.model('venue');

var calculateLastRating = function (incomingVenue, isDeleted){
    var i,
    numComments,
    avgRating,
    sumRating = 0;

    var numComments = incomingVenue.comments.length;
    if (incomingVenue.comments) {
        if (incomingVenue.comments.length == 0 && isDeleted) {
            avgRating =0;
        }
        else{
            for (i=0; i < numComments; i++) {
               sumRating +=incomingVenue.comments[i].rating;
            }
            avgRating = Math.ceil(sumRating/numComments);
        }
        incomingVenue.rating=avgRating;
        incomingVenue.save();
    }
};
var updateRating = function (venueid,isDeleted) {
    venue.findById(venueid)
    .select("rating comments")
    .exec()
    .then(function (venue){
        calculateLastRating(venue,isDeleted);
    });
};
var createComment = function (req,res,incomingVenue){
    try {
        incomingVenue.comments.push(req.body);
        incomingVenue.save().then(function(venue){
            var comments = venue.comments;
            var comment = comments[comments.length-1];
            updateRating(venue._id,false);
            createResponse(res,"201",comment);
          }); 
    } catch (error) {
        createResponse(res,"400", error);
    }
};
const createResponse = function(res,status,content){
    res.status(status).json(content);
}
const getComment = async function(req,res){
    try {
        await venue.findById(req.params.venueid).select("name comments").exec().then(function(venue){
            var response, comment;
            comment = venue.comments.id(req.params.commentid);
            response = { 
                venue: {
                    name: venue.name,
                    id: req.params.id
                },
                "comments" : comment
            }
            createResponse(res, "200", response)
        })
    } catch (error) {
        createResponse(res, "404", error)
    }
}
const addComment =  async function(req,res){
    try {
        await venue.findById(req.params.venueid)
        .select("comments")
        .exec()
        .then((incomingVenue)=>{
            createComment(req,res,incomingVenue);

        });
    } catch (error) {
        createResponse(res,"400",error)
    }
}
const deleteComment = async function(req,res){
    try{
        await venue.findById(req.params.venueid)
            .select("comments")
            .exec()
            .then(function (venue) {
                try {
                    let comment = venue.comments.id(req.params.commentid)
                    comment.deleteOne()
                    venue.save().then(function() {
                        updateRating(venue._id,true);
                        createResponse(res,"200", { "status": comment.author+" isimli kişinin yorumu silindi."});
                    })
                }
                catch(error){
                    createResponse(res,"400", error);       
                }
            }) 
    }
    catch(error){
        createResponse(res,"400", error);
    }
}
const updateComment = async function(req,res){
    try{
        await venue.findById(req.params.venueid)
            .select("comments")
            .exec()
            .then(function (venue) {
                try {
                    let comment = venue.comments.id(req.params.commentid)
                    comment.set(req.body)
                    venue.save().then(function(venue){
                        updateRating(venue._id,false);
                        createResponse(res,"201", comment);
                    });
                }
                catch (error) {
                    createResponse(res,"400", error);
                }
            })
    }
    catch(error){
        createResponse(res,"400", error);
    }
}
 module.exports = {
    getComment,
    addComment,
    deleteComment,
    updateComment,
 };