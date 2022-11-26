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

function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}

async function run(){
    try{
        const laptopsCollection =  client.db("laptopBuySell").collection("laptops");
        const categoriesCollection = client.db("laptopBuySell").collection("categories");
        const bookingsCollection = client.db("laptopBuySell").collection("bookings");

        app.get('/categories', async(req, res) => {
            const query= {}
            const categories = await categoriesCollection.find(query).toArray();
            res.send(categories)
        })

        // app.get('/laptops', async(req, res)=>{
        //     const query = {};
        //     const laptops = await laptopsCollection.find(query).toArray();
        //     res.send(laptops)
        // })

        app.get('/laptops/:category', async(req, res)=>{
            const category = req.params.category;
            const query = {category:category}
            const laptopCategory = await laptopsCollection.find(query).toArray();
            res.send(laptopCategory);
        })

        // Post Booking Products
        app.post('/booking', async(req, res)=>{
            const data = req.body;
            const result = await bookingsCollection.insertOne(data);
            res.send(result);
        })

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });

    }
    finally{

    }
}

run().catch(err => console.log(err))


app.get('/', (req, res)=>{
    res.send('Laptop Buy Sell service working')
})

app.listen(port, ()=>{
    console.log(`Laptop Buy Sell service running on port ${port}`)
})