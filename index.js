const express = require('express')
const app = express()
const path = require('path')
const port = process.env.PORT || 3000
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const mongo = process.env.MONGODB || 'mongodb://cris:teste123@ds137498.mlab.com:37498/blog';

const session = require('express-session');

// added models
const User = require('./models/user');

//added routes
const noticias= require('./routes/noticias'); 
const restrito= require('./routes/restrito'); 

mongoose.Promise = global.Promise;

// added sections
app.use(session ({ 
  secret: 'session-secret',
  resave: true,
  saveUninitialized: true
 }));

// set bodyParser to post HTML
app.use(bodyParser.urlencoded({extended: true}));

// set template engine ejs
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => res.render('index'))

// criando fluxo para autenticação
app.use('/restrito', (req, res, next) => {
  if('user' in req.session) {
    return next()
  }
  // res.send('faça o login');
  res.redirect('/login');
});

app.use('/restrito', restrito);
app.use('/noticias', noticias);

app.get('/login', (req, res) => {
  res.render('login/login');
});

app.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  // validando senha se está oka
  const isValid = await user.checkPassword(req.body.password);
  // validando login de acesso
  if(isValid) {
    req.session.user = user;
    res.redirect('/restrito');
  } else {
    res.redirect('/login');
  }
  // checando as informações.
  // res.send({
  //   user 
  //   // isValid
  // });
});

mongoose
  .connect(mongo, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    createInicialUser();
    app.listen(port, () => {
       console.log(`App rodando em http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(`Ocorreu um erro, veja em: ${err}`);
  });

  // criando user inicial
const createInicialUser = async() => {
  const total = await User.countDocuments({
    username: 'cristofersousa'
  });
  if( total === 0) {
    const user = new User({
          username: 'cristofersousa',
            password: 'abc123'
        });
      await user.save();
       console.log('created user'); 
    } else {
      console.log('user skipperd');
    }
}

// // criando um uer inicial de forma não automatica.
//   User.count({username: 'cristofersousa' })
//   .then(total => {
//     console.log(total);
//     if(total === 0) {
//     const user = new User({
//           username: 'cristofersousa',
//             password: 'abc123'
//         });
//       user.save(() => console.log('created user')); 
//     }
//   });


  // criando o primeiro user para salvar no banco
  // const user = new User({
  //   username: 'cristofersousa',
  //   password: 'abc123'
  // });

  // user.save(() => console.log('salve user')); 

  // const bcrypt = require('bcrypt')
  // bcrypt.genSalt((err, salt) => {
  //   console.log(salt)
  //   bcrypt.hash('abc123', salt, ( err, hash) => {
  //     console.log(hash);
  //   })
  // });