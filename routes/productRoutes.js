const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const productsFilePath = path.join(__dirname, '../data/products.js');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

const checkFileType = (file, cb) => {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
};

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

// @desc    Upload an image
// @route   POST /api/upload
// @access  Private/Admin
router.post('/upload', upload.single('image'), (req, res) => {
    res.send(`/${req.file.path.replace(/\\/g, '/')}`);
});

const getProducts = () => {
    delete require.cache[require.resolve(productsFilePath)];
    return require(productsFilePath);
};

const saveProducts = (products) => {
    const content = `const products = ${JSON.stringify(products, null, 4)};\n\nmodule.exports = products;`;
    fs.writeFileSync(productsFilePath, content);
};

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get('/', (req, res) => {
    try {
        const products = getProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', (req, res) => {
    try {
        const products = getProducts();
        const product = products.find(p => p._id === req.params.id);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', (req, res) => {
    try {
        const products = getProducts();
        const { name, price, description, image, images, category, countInStock, size, highlights } = req.body;

        const newProduct = {
            _id: (Math.max(...products.map(p => parseInt(p._id))) + 1).toString(),
            name,
            price: Number(price),
            description,
            image,
            images: images || [image],
            category,
            countInStock: Number(countInStock),
            images: images || [image],
            category,
            countInStock: Number(countInStock),
            size,
            highlights: req.body.highlights || []
        };

        products.push(newProduct);
        saveProducts(products);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error creating product', error: error.message });
    }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', (req, res) => {
    try {
        const products = getProducts();
        const index = products.findIndex(p => p._id === req.params.id);

        if (index !== -1) {
            const { name, price, description, image, images, category, countInStock, size } = req.body;

            products[index] = {
                ...products[index],
                name: name || products[index].name,
                price: price ? Number(price) : products[index].price,
                description: description || products[index].description,
                image: image || products[index].image,
                images: images || products[index].images,
                category: category || products[index].category,
                countInStock: countInStock ? Number(countInStock) : products[index].countInStock,
                countInStock: countInStock ? Number(countInStock) : products[index].countInStock,
                size: size || products[index].size,
                highlights: req.body.highlights || products[index].highlights
            };

            saveProducts(products);
            res.json(products[index]);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error updating product', error: error.message });
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', (req, res) => {
    try {
        let products = getProducts();
        const productExists = products.find(p => p._id === req.params.id);

        if (productExists) {
            products = products.filter(p => p._id !== req.params.id);
            saveProducts(products);
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
