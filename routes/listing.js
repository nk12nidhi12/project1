const express = require("express");
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');

const Listing = require('../models/listing.js')
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js")

const listingController = require("../controllers/listings.js")
const multer = require("multer");
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage })


// index route, to display all title of each item
// to add the listing to database
router
.route("/")
.get( wrapAsync(listingController.index))
.post(isLoggedIn,
    upload.single('listing[image]'), validateListing,
    wrapAsync(listingController.createListing)
); 


//to create new listings
router.get('/new', isLoggedIn , listingController.renderNewForm)

//to display in details (show route)
//to update it
//to delete a record
router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing,
    wrapAsync(listingController.updateListing))
    .delete( isLoggedIn, isOwner,
    wrapAsync(listingController.destroyListing));


//to edit form
router.get(
    '/:id/edit', isLoggedIn, isOwner, 
    wrapAsync(listingController.renderEditForm)
)

module.exports = router;