const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const bodyParser = require('body-parser');
const loginRoutes = require('./routes/login');
const { CosmosClient } = require('@azure/cosmos');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('views', __dirname + '/views');
app.engine('.hbs', engine({
    extname: '.hbs',
}));
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

const endpoint = "https://stevemaster.documents.azure.com:443/";
const key = "3NaYq5nNN04Em6HuIIb4GyKQ9dnvuYPGXYYe2qNkBGDfDA0kXvtQgNDenCzOB7TG7Z6D2yeC7ZOEACDbC6DSpA==";  // You might want to secure this
const client = new CosmosClient({ endpoint, key });

app.use((req, res, next) => {
    req.cosmosClient = client;
    next();
});

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.listen(app.get('port'), () => {
    console.log('listening on port ', app.get('port'));
});

app.use('/', loginRoutes);

app.get('/', (req, res) => {
    if (req.session.loggedin) {
        let name = req.session.name;
        res.render('home', { name });
    } else {
        res.redirect('/login');
    }
});
