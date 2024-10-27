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
const Razorpay = require('razorpay');


const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});



const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
});
app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(nocache());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


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
        neq: (a, b) => a !== b,
        gt: (a, b) => a > b,
        lt: (a, b) => a < b,
        mod: (a, b) => a % b,
        floor: (num) => Math.floor(num),
        add: (a, b) => a + b,
        sub: (a, b) => a - b,
        formatDate: (date, formatString) => {
            if (!(date instanceof Date) || isNaN(date)) {
                return 'Invalid Date'; // Fallback if date is invalid
            }
            return format(new Date(date), formatString);
         },
        range: (min, max) => {
            const range = [];
            for (let i = min; i <= max; i++) {
                range.push(i);
            }
            return range;
        },
        isEmpty: (array) => {
            return array.length === 0;
        },
        ifEquals: function(arg1, arg2, options) {
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
        },
    }
}));

app.use((req, res, next) => {
    res.locals.loginMethod = req.session.loginMethod;
    next();
});

app.use('/', adminRouter);
app.use('/', userRouter);
app.use('/auth', authRouter);

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


