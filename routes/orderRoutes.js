const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { protect, admin } = require('../middleware/authMiddleware');

// ... existing code ...

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, admin, (req, res) => {
    const orders = getOrders();
    res.json(orders);
});

// @desc    Get logged in user orders

const ordersFilePath = path.join(__dirname, '../data/orders.js');

const getOrders = () => {
    delete require.cache[require.resolve(ordersFilePath)];
    return require(ordersFilePath);
};

const saveOrders = (orders) => {
    const content = `const orders = ${JSON.stringify(orders, null, 4)};\n\nmodule.exports = orders;`;
    fs.writeFileSync(ordersFilePath, content);
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, admin, (req, res) => {
    const orders = getOrders();
    const order = orders.find(o => o._id === req.params.id);

    if (order) {
        order.status = req.body.status || order.status;
        if (req.body.isPaid !== undefined) {
            order.isPaid = req.body.isPaid;
        }
        // If status is set to Paid manually, also set isPaid to true
        if (req.body.status === 'Paid') {
            order.isPaid = true;
        }

        saveOrders(orders);
        res.json(order);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, (req, res) => {
    const { orderItems, shippingAddress, totalPrice, paymentMethod, paymentScreenshot } = req.body;
    const orders = getOrders();

    if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    }

    const newOrder = {
        _id: Date.now().toString(),
        user: req.user._id,
        orderItems,
        shippingAddress,
        totalPrice,
        paymentMethod: paymentMethod || 'Manual',
        paymentScreenshot: paymentScreenshot || null,
        isPaid: false,
        status: 'Pending', // Default status for manual payment is Pending until verified
        createdAt: new Date().toISOString(),
    };

    orders.push(newOrder);
    saveOrders(orders);

    res.status(201).json(newOrder);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, (req, res) => {
    const orders = getOrders();
    const myOrders = orders.filter(o => o.user === req.user._id);
    res.json(myOrders);
});

module.exports = router;
