// Import dependencies
const express = require('express')
const expressWs = require('express-ws')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')

let messageCache = [

]
// Create a new express application named 'app'
const app = express()
expressWs(app)

const connections = new Set()
const wsHandler = (ws) => {
  // Add the connection to our set
  connections.add(ws)

  // We define the handler to be called everytime this
  // connection receives a new message from the client
  ws.on('message', (message) => {
    // Once we receive a message, we send it to all clients
    // in the connection set
    messageCache.push(message)
    connections.forEach((conn) => conn.send(message))
  })

  messageCache.forEach(msg => ws.send(msg))

app.ws('/chat', wsHandler)

// Set our backend port to be either an environment variable or port 5000
const port = process.env.PORT || 8080

// This application level middleware prints incoming requests to the servers console, useful to see incoming requests
app.use((req, res, next) => {
  console.log(`Request_Endpoint: ${req.method} ${req.url}`)
  next()
})

// Configure the bodyParser middleware
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

// Require Route
const api = require('./routes/routes')
const { ws } = require('./routes/routes')
// Configure app to use route
app.use('/api/v1/', api)

// Configure the CORs middleware
app.use(cors())

// This middleware informs the express application to serve our compiled React files
if (
  process.env.NODE_ENV === 'production' ||
  process.env.NODE_ENV === 'staging'
) {
  app.use(express.static(path.join(__dirname, 'client/build')))

  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'))
  })
}

// Catch any bad requests
app.get('*', (req, res) => {
  res.status(200).json({
    msg: 'Catch All',
  })
})

// Configure our server to listen on the port defiend by our port variable
app.listen(port, () => console.log(`BACK_END_SERVICE_PORT: ${port}`))
