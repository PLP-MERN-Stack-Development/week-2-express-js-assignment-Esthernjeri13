require('dotenv').config();
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { NotFoundError, ValidationError } = require('./errors');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Parse JSON bodies

// Custom logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// In-memory database
let products = [
  {
    id: uuidv4(),
    name: 'Laptop',
    description: 'High performance laptop',
    price: 999.99,
    category: 'Electronics',
    inStock: true
  },
  {
    id: uuidv4(),
    name: 'Smartphone',
    description: 'Latest model',
    price: 699.99,
    category: 'Electronics',
    inStock: true
  }
];

// Authentication middleware
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// Validation middleware
const validateProduct = (req, res, next) => {
  const { name, price, category } = req.body;
  
  if (!name || !price || !category) {
    throw new ValidationError('Name, price and category are required');
  }
  
  if (typeof price !== 'number') {
    throw new ValidationError('Price must be a number');
  }
  
  if (price <= 0) {
    throw new ValidationError('Price must be greater than 0');
  }
  
  next();
};

// Routes
app.get('/', (req, res) => {
  res.send('Products API is running');
});

// GET all products with filtering and pagination
app.get('/api/products', (req, res) => {
  const { category, page = 1, limit = 10 } = req.query;
  let result = [...products];
  
  // Filter by category if provided
  if (category) {
    result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedResults = result.slice(startIndex, endIndex);
  
  res.json({
    data: paginatedResults,
    currentPage: parseInt(page),
    totalPages: Math.ceil(result.length / limit),
    totalItems: result.length
  });
});

// GET single product
app.get('/api/products/:id', (req, res, next) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return next(new NotFoundError('Product not found'));
  }
  res.json(product);
});

// POST new product
app.post('/api/products', authenticate, validateProduct, (req, res) => {
  const product = {
    id: uuidv4(),
    ...req.body,
    inStock: req.body.inStock || true
  };
  products.push(product);
  res.status(201).json(product);
});

// PUT update product
app.put('/api/products/:id', authenticate, validateProduct, (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return next(new NotFoundError('Product not found'));
  }
  
  products[index] = { 
    ...products[index], 
    ...req.body,
    id: products[index].id // Prevent ID change
  };
  
  res.json(products[index]);
});

// DELETE product
app.delete('/api/products/:id', authenticate, (req, res, next) => {
  const initialLength = products.length;
  products = products.filter(p => p.id !== req.params.id);
  
  if (products.length === initialLength) {
    return next(new NotFoundError('Product not found'));
  }
  
  res.status(204).end();
});

// Search endpoint
app.get('/api/products/search', (req, res, next) => {
  const { q } = req.query;
  if (!q) {
    return next(new ValidationError('Search query required'));
  }
  
  const results = products.filter(p => 
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.description.toLowerCase().includes(q.toLowerCase())
  );
  
  res.json(results);
});

// Statistics endpoint
app.get('/api/products/stats', (req, res) => {
  const stats = {
    totalProducts: products.length,
    byCategory: products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {}),
    inStock: products.filter(p => p.inStock).length,
    outOfStock: products.filter(p => !p.inStock).length
  };
  
  res.json(stats);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: {
      message: err.message,
      status: statusCode,
      timestamp: new Date().toISOString()
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Key required for write operations: ${process.env.API_KEY}`);
});