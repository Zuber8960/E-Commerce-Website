const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const cors = require('cors');
const app = express();

const dotenv = require('dotenv');
dotenv.config();

const errorController = require('./controllers/error');
const sequelize = require('./util/database');


app.use(cors());
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/orderItem');

// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
})


app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

User.hasMany(Order);
Order.belongsTo(User);
Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

const port = 4000;
sequelize
  .sync()
  // .sync({force : true})
  .then((result) => {
    return User.findByPk(1);
  })
  .then(user => {
    if (!user) {
      return User.create({ name: 'Zuber', email: 'zuber@gmail.com' })
    }
    return user;
  })
  .then((user) => {
    // console.log(user);
    return user.createCart();
  })
  .then(() => {
    return Product.findByPk(1);
  })
  .then(product => {
    if(!product){
      return Product.create({
        title : 'Avenger-T-Shirt',
        price : 135,
        imageUrl : 'https://m.media-amazon.com/images/W/WEBP_402378-T1/images/I/71lDPJJ0sZL._UX679_.jpg',
        description : 'Avenger-T-Shirt for men',
        userId : 1
      })
    }
    return product;
  })
  .then(() => {
    return Product.findByPk(2);
  })
  .then(product => {
    if(!product){
      return Product.create({
        title : 'Winter-Jacket',
        price : 199,
        imageUrl : 'https://m.media-amazon.com/images/W/WEBP_402378-T1/images/I/51yu8UMD04L._UX679_.jpg',
        description : 'Winter-Jacket',
        userId : 1
      })
    }
    return product;
  })
  .then(() => {
    return Product.findByPk(3);
  })
  .then(product => {
    if(!product){
      return Product.create({
        title : 'Bluetooth-Headphone',
        price : 249,
        imageUrl : 'https://m.media-amazon.com/images/W/WEBP_402378-T1/images/I/51JbsHSktkL._SX450_.jpg',
        description : 'An Amazing Airbods',
        userId : 1
      })
    }
    return product;
  })
  .then(() => {
    return Product.findByPk(4);
  })
  .then(product => {
    if(!product){
      return Product.create({
        title : 'Airbods-Pro',
        price : 289,
        imageUrl : 'https://m.media-amazon.com/images/W/WEBP_402378-T1/images/I/71mT2gCHH+L._SY450_.jpg',
        description : 'An Amazing Airbods',
        userId : 1
      })
    }
    return product;
  })
  .then((cart) => {
    // console.log(cart);
    console.log(`listening to the ${port}`);
    app.listen(port);
  })
  .catch(err => console.log(err))

