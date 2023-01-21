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

const shopRoutes = require('./routes/shop');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/orderItem');

// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ extended: false }));



app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
})

app.use(express.static(path.join(__dirname, 'frontend')));


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



const port = process.env.port;
sequelize
  .sync()
  // .sync({force : true})
  .then((result) => {
    return User.findByPk(1)
    .then(user => {
      if (!user) {
        return User.create({ name: 'Zuber', email: 'zuber@gmail.com' })
      }
      return user;
    })
  })
  .then((user) => {
    return user.createCart();
  })
  .then((cart) => {
    // console.log(cart);
    console.log(`listening to the port:${port}`);
    app.listen(port);
  })
  .catch(err => console.log(err))

