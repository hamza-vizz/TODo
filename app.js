var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const bcrypt = require('bcrypt');

const sequelize = require('./config/db');
const User = require('./models/user');
const Product = require('./models/product');
const Review = require('./models/review');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'my_super_secret_key_123',
  resave: false,
  saveUninitialized: false
}));
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user;
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/admin', adminRouter);
User.hasMany(Review);
Review.belongsTo(User);
Product.hasMany(Review, { onDelete: 'CASCADE' });
Review.belongsTo(Product);
async function createAdmin() {
  try {
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Super Admin',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('👑 Admin account created (admin@test.com / admin123)');
    }
  } catch (err) {
    console.error("Error creating admin: ", err);
  }
}
sequelize.sync({ alter: true })
  .then(async () => {
    console.log('✅ Database & tables synced!');
    await createAdmin();
  })
  .catch(err => console.log('❌ Error syncing DB: ', err));
app.use(function (req, res, next) {
  next(createError(404));
});
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;