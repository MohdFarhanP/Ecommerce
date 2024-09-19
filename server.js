
const express = require('express');
const app = express();
const hbs = require('hbs');
const path = require('path');

app.set(express.static(path.join(__dirname,'public')));
app.set('views',path.join(__dirname,'views'));
app.set('view engine','hbs');

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.engine('hbs', exphbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials')
  }));