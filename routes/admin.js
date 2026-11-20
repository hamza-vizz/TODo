const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const isAdmin = require('../middleware/isAdmin');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/add-product', isAdmin, (req, res) => {
    res.render('add-product', { error: null });
});

router.post('/add-product', isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, description, price } = req.body;

        let imageUrl = 'https://picsum.photos/400/300'; // Default fallback
        if (req.file) {
            imageUrl = '/uploads/' + req.file.filename;
        }

        await Product.create({ name, description, price, imageUrl });
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding product");
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