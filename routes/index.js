const express = require('express');
const router = express.Router();
const Product = require('../models/product');

const Review = require('../models/review');
const User = require('../models/user');


/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    // Fetch all products from the database
    const products = await Product.findAll();

    // Render the 'index' page and pass the products
    res.render('index', {
      title: 'My E-Commerce Store',
      products: products
    });
  } catch (err) {
    next(err); // Pass errors to Express error handler
  }
});

router.get('/product/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      // Include the reviews AND the user who wrote the review
      include: [{
        model: Review,
        include: [User]
      }]
    });

    if (!product) {
      return res.status(404).send('Product not found');
    }

    res.render('product-details', { product });
  } catch (err) {
    next(err);
  }
});

// POST: Submit a Review
router.post('/product/:id/review', async (req, res, next) => {
  try {
    // 1. Check if user is logged in
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }

    const { rating, comment } = req.body;

    // 2. Create the review
    await Review.create({
      rating: parseInt(rating),
      comment: comment,
      UserId: req.session.user.id,       // From session
      ProductId: req.params.id           // From URL
    });

    // 3. Reload the product page to see the new review
    res.redirect(`/product/${req.params.id}`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;