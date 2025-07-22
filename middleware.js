const Listing = require("./models/listing.js")
const Review = require("./models/review.js")
const ExpressError = require('./utils/ExpressError.js')
const { listingSchema, reviewSchema } = require('./schema.js')

module.exports.isLoggedIn = (req, res, next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl; 
        req.flash("error","login required!");
        return res.redirect("/login")
    }
    next();
}

//as soon as passport.authenticate middleware gives success message the value of req.session is reset, so req.session.redirectUrl is deleted from req.session, so we use locals to store this value as it do not reset by passport
module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async(req, res, next) => {
    let { id } = req.params
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not authorized to make changes.");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async(req, res, next) => {
    let { id, reviewId } = req.params
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not authorized to make changes.");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body) //Joi validation error object
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(',')
        // error.details is an array of error objects. Each object has a .message field (a string describing the error)
        // map JavaScript ka built-in array method hai. Ye array ke har element pe ek function apply karta hai aur ek naya array return karta hai jisme har element updated hota hai.
        throw new ExpressError(400, errMsg)
    } else {
        next()
    }
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body) //Joi validation error object
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(',')
        throw new ExpressError(400, errMsg)
    } else {
        next();
    }
}