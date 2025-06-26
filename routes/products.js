const express = require('express');
const router = express.Router();
const controller = require('../controllers/products');
const { authenticate } = require('../middleware/auth');
const { validateProduct } = require('../middleware/validation');

// Public routes
router.get('/', (req, res) => {
  const result = controller.getAllProducts(
    req.query.category, 
    req.query.page, 
    req.query.limit
  );
  res.json(result);
});

router.get('/:id', (req, res) => {
  const product = controller.getProductById(req.params.id);
  res.json(product);
});

// Protected routes
router.post('/', authenticate, validateProduct, (req, res) => {
  const newProduct = controller.createProduct(req.body);
  res.status(201).json(newProduct);
});

router.put('/:id', authenticate, (req, res) => {
  const updatedProduct = controller.updateProduct(req.params.id, req.body);
  res.json(updatedProduct);
});

router.delete('/:id', authenticate, (req, res) => {
  controller.deleteProduct(req.params.id);
  res.status(204).end();
});

module.exports = router;