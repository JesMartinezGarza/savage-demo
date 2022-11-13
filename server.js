const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

var db, collection;

const url = "mongodb+srv://axisMundi:mFGpPJbo76y9rtB5@cluster0.xumwt9o.mongodb.net/Authenticate?retryWrites=true&w=majority";
const dbName = "demo";

app.listen(2121, () => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if(error) {
            throw error;
        }
        db = client.db(dbName);
        console.log("Connected to collection `" + dbName + "`!");
    });
});

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', (req, res) => {
  db.collection('messages').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', {messages: result})
  })
})

app.post('/messages', (req, res) => {
  console.log(req.body)
  db.collection('messages').insertOne({name: req.body.name, msg: req.body.msg, like: 0, dislike:0, likeScore:0, unicorn: req.body.adLib}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  })
})

app.put('/like', (req, res) => {
  console.log(`${req.body.name}, you received a like!`)
  console.log(`You had ${req.body.likeScore} likes, and now you have ${req.body.likeScore + 1} likes!`)
  db.collection('messages').findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      like: req.body.likeScore + 1,
      likeScore: req.body.likeScore + 1
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

app.put('/dislike', (req, res) => {
  console.log(`Ignore the haters, ${req.body.name}!`)
  console.log(`You had ${req.body.likeScore} likes, but now you have ${req.body.likeScore - 1} likes.`)

  db.collection('messages').findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      dislike: 0 - req.body.likeScore,
      likeScore: req.body.likeScore - 1
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})


app.delete('/delete', (req, res) => {
  console.log(`Goodbye, ${req.body.name}!`)
  db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})
