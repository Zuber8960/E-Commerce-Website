const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/products', shopController.getProducts);

router.get('/cart', shopController.getCart);

router.post('/cart', shopController.postCart);

router.get('/orders', shopController.getOrders);

router.post('/orders', shopController.createOrder);

router.post('/cart-delete-item', shopController.postCartDeleteProduct);

module.exports = router;
