const Listing = require("../models/listing")

module.exports.index = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    const totalListings = await Listing.countDocuments();
    const allListings = await Listing.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const totalPages = Math.ceil(totalListings / limit);

    res.render('listings/index.ejs', { allListings, page, totalPages });
}

module.exports.renderNewForm = (req, res) => {
    res.render('listings/new.ejs')
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params
    const listing = await Listing.findById(id).populate({
        path:"reviews", populate:{
        path:"author"
        },
    }).populate("owner");
    if(!listing){
        req.flash("error","Requested listing does not exist");
        return res.redirect("/listings");
    }
    res.render('listings/show.ejs', { listing })
}

module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing)
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    await newListing.save()
    req.flash("success","New Listing Created")
    res.redirect('/listings')
}

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params
    const listing = await Listing.findById(id)
    if(!listing){
        req.flash("error","Requested listing does not exist");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250")
    res.render('listings/edit.ejs', { listing, originalImageUrl})
} 

module.exports.updateListing = async (req, res) => {
    let { id } = req.params
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }

    req.flash("success","Listing updated")
    res.redirect(`/listings/${id}`)
}

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params
    let deletedListing = await Listing.findByIdAndDelete(id)
    console.log(deletedListing);
    req.flash("success","Listing deleted")
    res.redirect('/listings')
}
