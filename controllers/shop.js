const Product = require('../models/product');
const Cart = require('../models/cart');

const Items_per_page = 2;

exports.getProducts = async (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems = await Product.count();

  await Product.findAll({
    offset: (page - 1) * Items_per_page,
    limit: Items_per_page
  })
    .then(products => {
      res.status(200).json({
        products: products,
        currentPage: page,
        hasNextPage: Items_per_page * page < totalItems,
        nextPage: page + 1,
        hasPreviousPage: page > 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / Items_per_page)
      })
    })
    .catch(err => {
      console.log(err);
    })
};


exports.getCart = (req, res, next) => {

  req.user
    .getCart()
    .then(cart => {
      // console.log(cart);
      return cart
        .getProducts()
        .then(products => {
          res.status(200).json({ success: true, products: products });
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({ success : false, products: `Error Occured`});
        })
    })
    .catch(err => console.log(err));
};


exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  if (!prodId) {
    console.log('product id is missing.')
    return res.status(400).json({ success: false, message: 'product id is missing.' })
  }

  let fetchedCart;
  let newQuantity = 1;
  req.user
    .getCart()
    .then(cart => {
      console.log('hi', cart);
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } })
    })
    .then(products => {
      let product;
      if (products.length) {
        product = products[0];
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }
      return Product.findByPk(prodId);
    })
    .then(product => {
      // console.log(`hello`, product);
      fetchedCart.addProduct(product, {
        through: { quantity: newQuantity }
      })
      return product;
    })
    .then(product => {
      res.status(200).json({ success: true, message: `Product: ${product.title} added to the cart Successfully.`});
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ success: false, message: 'Error Occured.' });
    })

};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .getCart()
    .then(cart => {
      // console.log(cart);
      return cart.getProducts({ where: { id: prodId } });
    })
    .then(products => {
      const product = products[0];
      let deletedProuctDetails = product;
      product.cartItem.destroy();
      return deletedProuctDetails;
    })
    .then(result => {
      res.status(200).json({ success: true, message: `${result.title} has been deleted from the cart successfully.`, data: result })
      // res.redirect('/cart');
    })
    .catch(err => console.log(err));
}


exports.createOrder = async (req, res, next) => {
  try {
    let products, newOrder;

    await req.user
      .getCart()
      .then(cart => {
        return cart.getProducts();
      })
      .then(result => {
        products = result;
      })
      .catch(err => console.log(err))

    await req.user
      .createOrder()
      .then(order => {
        for (let i = 0; i < products.length; i++) {
          order.addProduct(products[i], { through: { quantity: products[i].cartItem.quantity } })
        }
        return order;
      })
      .then(order => {
        newOrder = order;
      })
      .catch(err => console.log(err));

    await req.user.getCart()
      .then(cart => {
        return cart.getProducts();
      })
      .then(products => {
        products.forEach(product => {
          product.cartItem.destroy();
        });
      })
      .catch(err => console.log(err));

    await res.status(200).json({ success: true, message: `Order has placed successfully.`, orderId: newOrder.id, order: newOrder });
  } catch (err) {
    console.log(err)
    res.status(400).json({ success: false, message: `Something went wrong`, orderId: 'Error Occered' })
  }
}


exports.getOrders = (req, res, next) => {
  req.user.getOrders({ include: ['products'] }) 
    .then(orders => {
      // console.log(orders);
      res.status(200).json(orders);
    })
    .catch(err => console.log(err))
};



exports.homePage = (req, res, next) => {
  res.status(200).send(`<html><title>Home Page</title>
  <h1>Welcome to the Zuber's E-Commerce Website</h1><hr>
  <b>Go to Home Page</b> <a href=http://${req.hostname}:4000/store.html><button class="btn">Click me</button></a></html>`);
}