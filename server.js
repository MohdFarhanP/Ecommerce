require('dotenv').config();
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const hbs = require('hbs');
const path = require('path');
const nocache = require("nocache");
const connectDb = require("./db/connect")
const adminRouter = require('./routes/admin')
const userRouter = require('./routes/user');
const { error } = require('console');
const session = require('express-session');

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }, 
}));

app.set('views',path.join(__dirname,'views'));
app.set('view engine','hbs');
app.use(express.static(path.join(__dirname,'public')));

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(nocache());

app.engine('hbs', exphbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials')
  }));

  app.use('/admin',adminRouter);
  app.use('/user',userRouter)
  
  connectDb();

  app.listen(process.env.PORT || 3001,(error)=>{
    if(error)
    console.log("server port error",error);
  })