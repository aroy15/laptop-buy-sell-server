const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors())
app.use(express.json())


app.get('/', (req, res)=>{
    res.send('Laptop By Sell service working')
})

app.listen(port, ()=>{
    console.log(`Laptop Buy Sell service running on port ${port}`)
})