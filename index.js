const express = require('express')
const app = express()
const path = require('path')
const User = require('./models/users')
const Noticia = require('./models/noticia')
const port = process.env.PORT || 3000
const mongoose = require('mongoose')
const mongodb = process.env.MONGODB || 'mongodb://localhost/noticias'
const session = require('express-session')
const noticias = require('./routes/noticias')
const restrito = require('./routes/restrito')
const auth = require('./routes/auth')
const pages = require('./routes/pages')
const admin = require('./routes/admin')

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(session({ secret: 'fullstack-master', resave: true, saveUninitialized: true }))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/', auth)
app.use('/', pages)

app.use('/admin', admin)
app.use('/restrito', restrito)
app.use('/noticias', noticias)


const createInitialUser = async () => {
  const total = await User.count({})
  if (total === 0) {
    const user = new User({
      username: 'celio',
      password: 1234,
      roles:['restrito','admin']
    })
    await user.save()
    const user2 = new User({
      username: 'celio2',
      password: 1234,
      roles:['restrito']
    })
    await user2.save()
  } else {
    console.log('init user already exists')
  }
  /*const noticia = new Noticia({
    title: 'Noticia publica 1',
    content:'Conteudo da noticia',
    category: 'public'
  })
  await noticia.save()

  const noticia2 = new Noticia({
    title:'Noticia privada 1',
    content:'conteudo da noticia',
    category: 'private'
  })
  await noticia2.save()*/
}
mongoose
  .connect(mongodb)
  .then(() => {
    createInitialUser()
    app.listen(port, () => {
      console.log('Listening on port :', port)
    })
  })
  .catch(e => {
    console.log(e)
  })
