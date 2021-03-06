import {} from 'dotenv/config'
import http from 'http'
import express from 'express'
import session from 'express-session'
import passport from 'passport'
import { ExpressPeerServer } from 'peer'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import url from 'url'

import enableCors from './middlewares/enableCors'
import githubAuthentication from './routes/v1/authentication'
import v1 from './routes/v1'
import { ENV, isProd, PORT, SECRET_KEY } from './config'
import { connectPeer, disconnectPeer, findPeerID } from './utils/peerUtils'

const app = express()
const server = http.createServer(app)
const peerServer = ExpressPeerServer(server, { debug: true })

app.use(enableCors)
app.use(bodyParser.json())
app.use(morgan('dev'))
app.use(session({ resave: false, saveUninitialized: false, secret: SECRET_KEY }))
app.use(passport.initialize())
app.use(passport.session())

app.use('/v1', ...v1, githubAuthentication)
app.use('/peerjs', peerServer)

app.get('/health', (req, res) => {
  res.sendStatus(200)
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.sendStatus(500)
})

server.listen(PORT, () => {
  console.log(`App is running on port: ${PORT} (${ENV})`)
})

peerServer.on('connection', connectPeer)
peerServer.on('disconnect', disconnectPeer)
