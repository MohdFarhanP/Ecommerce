
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const hbs = require('hbs');
const path = require('path');
const nocache = require("nocache");

const adminRouter = require('./routes/admin')

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

  app.listen(3000)