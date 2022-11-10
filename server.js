require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const dns = require('dns')
const urlparser = require('url')
let bodyParser = require('body-parser')
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3000

connectDB()

const urlSchema = new mongoose.Schema({
    url: 'string'
})

const Url = mongoose.model('url', urlSchema)

app.use(cors())

app.use(bodyParser.urlencoded({ extended: "false" }));

app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/views/index.html');
});
  
app.post('/api/shorturl/', function(req, res){
    console.log(req.body)
    const bodyUrl = req.body.url
    const wander = dns.lookup(urlparser.parse(bodyUrl).hostname, (err, urlAddress) => {
        if(!urlAddress){
            res.json({
                error: "Invalid URL"
            }) 
        } else{
            const url = new Url({ url: bodyUrl})
            url.save((err, data) =>{
                if(err) return res.json({
                    error: err
                })
                res.json({
                    original_url: data.url,
                    short_url: data.id
                })
            })
        }
    })
    console.log(wander)
})

app.get('/api/shorturl/:id',  (req, res) => {
    const id = req.params.id
    console.log(id)
    Url.findById((id), (err, data) => {
        if(!data){
            res.json({ error: "Invalid URL" })
        } 
        res.redirect(data.url)   
    })
});

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err)
})

