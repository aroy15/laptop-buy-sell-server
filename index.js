const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const usersCollection = client.db("laptopBuySell").collection("users");

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


        // Post users list
        app.post('/users', async(req, res)=>{
            const userData = req.body;
            const result = await usersCollection.insertOne(userData);
            res.send(result);
        })

        // Get All Sellers
        app.get('/sellers', async(req, res)=>{
            const query = {userRole:'seller'}
            const result = await usersCollection.find(query).toArray();
            res.send(result)
        })

        // Get all buyers
        app.get('/buyers', async(req, res)=>{
            const query = {userRole:'buyer'}
            const result = await usersCollection.find(query).toArray();
            res.send(result)
        })
        
        // delete user(seller/buyer)
        app.delete('/deleteUser/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)}
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })

        // Make verified sellers and his/her products
        app.patch('/makeVerifiedSeller',  async(req, res)=>{
            const email = req.query.email;
            const verified = req.body;
            const query = {email:email};
            const updatedDoc = {
                $set: verified
            }
            const result = await usersCollection.updateOne(query, updatedDoc);
            const verifyThatUsersProducts = await laptopsCollection.updateMany(query, updatedDoc);
            res.send({result, verifyThatUsersProducts})            
        })

        // check admin role
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.userRole === 'admin' });
        })

        // check seller role
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ 
                isSeller: user?.userRole === 'seller', 
                isVerified: user?.verified
            });
        })


        // My products
        app.get('/myProducts', async(req, res)=>{
            const email = req.query.email;
            const query = {email}
            const result = await laptopsCollection.find(query).toArray();
            res.send(result)
        })

        // Post Products
        app.post('/addProduct', async(req, res)=>{
            const product = req.body;
            const result = await laptopsCollection.insertOne(product);
            res.send(result)
        })

        // Delete Product
        app.delete('/deleteProduct/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)}
            const result = await laptopsCollection.deleteOne(query);
            res.send(result)
        })

        // Get Advertise product
        app.get('/advertise', async(req, res)=>{
            const query = {advertise:true}
            const result = await laptopsCollection.find(query).toArray();
            res.send(result)
        })
        
        // set Advertise with true/false
        app.patch('/advertise/:id', async(req, res)=>{
            const id = req.params.id;
            const advertise = req.body.advertise;
            const query = {_id:ObjectId(id)};
            const updatedDoc = {
                $set: {
                    advertise:advertise
                }
            }
            const result = await laptopsCollection.updateOne(query, updatedDoc);
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

        // temporary insert data
        // app.get('/laptopsTemp', async (req, res) => {
        //     const filter = {email:"rakibul@gmail.com"}
        //     const options = { upsert: true }
        //     const updatedDoc = {
        //         $set: {
        //             verified: false
        //         }
        //     }
        //     // const result = await laptopsCollection.updateMany(filter, updatedDoc, options);
        //     const result = await usersCollection.updateOne(filter, updatedDoc, options);
        //     res.send(result);
        // })
        // temporary product insert
        // app.get('/laptopsTemp', async (req, res) => {
        //     const filter = {}
        //     // const options = { upsert: true }
        //     const updatedDoc = { "name": "Dell Latitude 7480 Core i5 7th Gen Laptop", "category": "dell", "categoryImage": "https://raw.githubusercontent.com/aroy15/image-store/master/laptop/dell-logo.webp", "image": "https://raw.githubusercontent.com/aroy15/image-store/master/laptop/dell-latitude-7480-core-i5-7th-gen-laptop.webp", "location": "Chattogram", "yearsOfUse": 3, "resalePrice": 120, "originalPrice": 280, "postedTime": "Nov 17, 2022", "seller": "Rakibul", "verified": false, "condition": "good", "description": "Dell Latitude 7480 laptop has 256GB SSD storage capacity, 8GB RAM, 14 inch full HD display, 2 x USB 3.0 / USB 3.0 / LAN / HDMI interface, multi-gesture touch pad.", "mobile": "+8801627084196", "email": "rakibul@gmail.com" }
        //     const result = await laptopsCollection.insertOne(updatedDoc);
        //     res.send(result);
        // })

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