const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
var admin = require('firebase-admin');
require('dotenv').config()



var serviceAccount = require("./buraj-al-arab-firebase-adminsdk-fidcq-3d41ca7018.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



const app = express()
const port = 5000
app.use(cors())
app.use(bodyParser.json())


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1znel.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//database code
client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");

  //create 
  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })
  //read
  app.get('/bookings', (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer')) {
      const idToken = bearer.split(' ')[1];
      // idToken comes from the client app
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const userEmail = req.query.email;
          console.log(tokenEmail, userEmail)
          if (tokenEmail === req.query.email) {
            bookings.find({ email: userEmail })
              .toArray((err, document) => {
                res.send(document)
              })
          }

          // ...
        })
        .catch((error) => {
          // Handle error
        });

    }
    else {
      res.status(401).send("unauthorized access")
    }



  })
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port)