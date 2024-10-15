require('dotenv').config();
require('./config/passport');
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const path = require('path');
const nocache = require("nocache");
const connectDb = require("./db/connect");
const adminRouter = require('./routes/admin');
const userRouter = require('./routes/user');
const authRouter = require('./routes/auth');
const session = require('express-session');
const passport = require('passport');
const { format } = require('date-fns');



const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
});
app.use(sessionMiddleware);

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
        compare: (index, rating) => index < rating,
        multiply: (value1, value2) => value1 * value2,
        range: (start, end) => Array.from({ length: (end - start + 1) }, (_, i) => i + start),
        eq: (a, b) => a === b,
        gt: (a, b) => a > b,
        lt: (a, b) => a < b,
        mod: (a, b) => a % b,
        floor: (num) => Math.floor(num),
        add: (a, b) => a + b,
        formatDate:(date, formatString) => { return format(new Date(date), formatString); }
    }
}));


app.use('/', adminRouter); 
app.use('/', userRouter);
app.use('/', authRouter);

// app.use((req, res, next) => {
//     res.status(404).render('404');
// });


connectDb();


app.listen(process.env.PORT, (error) => {
    if (error) {
        console.log("Server port error", error);
    } else {
        console.log(`Server running on port ${process.env.PORT}`);
    }
});


