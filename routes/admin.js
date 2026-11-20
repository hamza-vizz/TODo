const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const isAdmin = require('../middleware/isAdmin'); // Import our middleware

// GET: Show Add Product Form (Protected by isAdmin middleware)
router.get('/add-product', isAdmin, (req, res) => {
    res.render('add-product', { error: null });
});

// POST: Save Product to Database
router.post('/add-product', isAdmin, async (req, res) => {
    try {
        const { name, description, price, imageUrl } = req.body;

        await Product.create({
            name,
            description,
            price,
            imageUrl: imageUrl || undefined // If empty, use default from model
        });

        res.redirect('/'); // Go back to homepage to see the new product
    } catch (err) {
        console.error(err);
        res.render('add-product', { error: 'Failed to add product. Check your inputs.' });
    }
});

// POST: Delete a Product
router.post('/delete-product/:id', isAdmin, async (req, res) => {
    try {
        const productId = req.params.id;

        const product = await Product.findByPk(productId);

        if (product) {
            await product.destroy();
        }

        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting product");
    }
});

module.exports = router;