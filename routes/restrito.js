const express = require('express')
const router = express.Router()
const Noticia = require('../models/noticia')

router.use((req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.roles.indexOf('restrito') >= 0) {
      next()
    } else {
      res.redirect('/login')
    }
  } else {
    res.redirect('/login')
  }
})
router.get('/', (req, res) => res.send('restrito'))
router.get('/noticias', async (req, res) => {
  const noticias = await Noticia.find({ category: 'private' })
  res.render('noticias/restrito', { noticias })
})

module.exports = router
