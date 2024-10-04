require('dotenv').config();
require('./config/passport');
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const hbs = require('hbs');
const path = require('path');
const nocache = require("nocache");
const connectDb = require("./db/connect")
const adminRouter = require('./routes/admin')
const userRouter = require('./routes/user');
const authRouter = require('./routes/auth');
const { error } = require('console');
const session = require('express-session');
const passport = require('passport');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(nocache());


app.engine('hbs', exphbs.engine({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
  helpers: {
    formatDate: function (date) {
      return new Date(date).toLocaleDateString();
    },

    compare: function (index, rating) {
      return index < rating;
    },
    multiply: function (value1, value2) {
      return value1 * value2;
    },
    range: function (start, end) {
      const result = [];
      for (let i = start; i <= end; i++) {
        result.push(i);
      }
      return result;
    },
    eq: function (a, b) {
      return a === b;
    },
    gt: function (a, b) {
      return a > b;
    },
    lt: function (a, b) {
      return a < b;
    },
    mod: function (a, b) {
      return a % b;
    },
    floor: function (num) {
      return Math.floor(num);
    },
    add: function (a, b) {
      return a + b;
    },
    
  }
}));

app.use('/admin', adminRouter);
app.use('/user', userRouter);
app.use('/auth', authRouter);

// app.use((req, res, next) => {
//   res.status(404).render('404');
// });
connectDb();

app.listen(process.env.PORT || 3001, (error) => {
  if (error)
    console.log("server port error", error);
})