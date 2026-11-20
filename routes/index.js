const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Review = require('../models/review');
const User = require('../models/user');
router.get('/', async (req, res, next) => {
  try {
    const products = await Product.findAll();
    res.render('index', {
      title: 'My E-Commerce Store',
      products: products
    });
  } catch (err) {
    next(err);
  }
});
router.get('/product/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
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
router.post('/product/:id/review', async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }
    const { rating, comment } = req.body;
    await Review.create({
      rating: parseInt(rating),
      comment: comment,
      UserId: req.session.user.id,
      ProductId: req.params.id
    });
    res.redirect(`/product/${req.params.id}`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;