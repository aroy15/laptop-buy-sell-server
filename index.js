const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uyqo5y4.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const laptopsCollection =  client.db("laptopBuySell").collection("laptops");

        app.get('/laptops', async(req, res)=>{
            const query = {};
            const laptops = await laptopsCollection.find(query).toArray();
            res.send(laptops)
        })
    }
    finally{

    }
}

run().catch(err => console.log(err))


app.get('/', (req, res)=>{
    res.send('Laptop By Sell service working')
})

app.listen(port, ()=>{
    console.log(`Laptop Buy Sell service running on port ${port}`)
})