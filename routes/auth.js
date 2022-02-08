const express = require('express')
const router = express.Router()
const User = require('../models/users')

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

router.use(passport.initialize())
router.use(passport.session())

passport.serializeUser((user, done) => {
  done(null, user)
})
passport.deserializeUser((user, done) => {
  done(null, user)
})
// definindo a estrategia para login local
passport.use(
  new LocalStrategy(async (username, password, done) => {
    const user = await User.findOne({ username })
    if (user) {
      const isValid = await user.checkPassword(password)
      if (isValid) {
        return done(null, user)
      } else {
        return done(null, false)
      }
    } else {
      return done(null, false)
    }
  })
)
// estrategia facebook
passport.use(
  new FacebookStrategy(
    {
      clientID: '522747902408367',
      clientSecret: '342d885fcb0a55691a1ec1873736a988',
      callbackURL: 'http://localhost:3000/facebook/callback',
      profileFields: ['id', 'displayName', 'email', 'photos'],
    },
    async (acessToken, refreshToken, profile, done) => {
      const userDb = await User.findOne({ facebookId: profile.id })
      if (!userDb) {
        const user = new User({
          name: profile.displayName,
          facebookId: profile.id,
          roles: ['restrito'],
        })
        await user.save()
        done(null, user)
      } else {
        done(null, userDb)
      }
    }
  )
)
// estrategia google
passport.use(
  new GoogleStrategy(
    {
      clientID: '974760678275-af3ffo6ju04lvu15dfhmrhqc3puo60ta.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:3000/google/callback',
    },
    async (acessToken, refreshToken, err,profile, done) => {
      const userDb = await User.findOne({ googleId: profile.id })
      if (!userDb) {
        const user = new User({
          name: profile.displayName,
          googleId: profile.id,
          roles: ['restrito'],
        })
        await user.save()
        done(null, user)
      } else {
        done(null, userDb)
      }
    }
  )
)
router.use((req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.user = req.user
    if (!req.session.role) {
      req.session.role = req.user.roles[0]
    }
    res.locals.role = req.session.role
  }
  /*if('user' in req.session){
    res.locals.user = req.session.user
    res.locals.role = req.session.role
  }*/
  next()
})
router.get('/change-role/:role', (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.roles.indexOf(req.params.role) >= 0) {
      req.session.role = req.params.role
    }
  }
  res.redirect('/')
})
router.get('/login', (req, res) => {
  res.render('login')
})
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/')
  })
})

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: false,
  })
)
router.get('/google', passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/userinfo.profile']}))
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/', successRedirect:'/' }))

router.get('/facebook', passport.authenticate('facebook'))
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }),
(req,res) =>{
  res.redirect('/')
}
)
/*router.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username })
  if(user){
  const isValid = await user.checkPassword(req.body.password)
  
    if (isValid) {
      req.session.user = user
      req.session.role = user.roles[0]
      res.redirect('/restrito/noticias')
    } else {
      res.redirect('/login')
    }
  }else{
    res.redirect('/login')
  }
  
})*/

module.exports = router
