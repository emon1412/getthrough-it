import express from 'express'

import passport from 'passport'
import passportGithub from 'passport-github2'
import db from '../../models'
import {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL
} from '../../config'

import {
  AUTH_GITHUB,
  AUTH_GITHUB_CALLBACK,
  AUTH_ME
} from '../routes'

const GitHubStrategy = passportGithub.Strategy
const UserModel = db['User']
passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: GITHUB_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile)
    UserModel
      .findOrCreate(
      { github_uid: profile.id },
      {
        github_uid: profile.id
        //more fields here
      },
      { new: true, upsert: true },
      )
      .then(done.bind(null, null))
      .catch(done)
  }
))

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser((id, done) => {
  User
    .findById(id)
    .then((user) => {
      done(null, {
        _id: user._id,
        display_name: user.display_name || undefined,
        email: user.email || undefined,
        photo_url: user.photo_url
      })
    })
})

const router = express.Router()

router.get(AUTH_GITHUB, passport.authenticate('github', { scope: ['email profile'] }))
router.get(AUTH_GITHUB_CALLBACK, passport.authenticate('github', { successRedirect: '/'}))

export default router
