const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r3nl2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

async function run() {
    try {
        await client.connect();
        console.log('Database Connected!');
        const database = client.db('bike-shop');
        const usersCollection = database.collection('users');
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const reviewCollection = database.collection('reviews');

        //GET USERS
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        //INSERT USER
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })

        //GOOGLE UPSERT
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };

            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);

        })

        //Make Admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        //GET API (Products)
        app.get('/products', async (req, res) => {
            const cursor = await productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })

        //POST API (Products)
        app.post('/products', async (req, res) => {
            const product = req.body;

            console.log('hit the post api', product);

            const result = await productsCollection.insertOne(product);
            console.log(result);
            res.json(result);

        });

        //GET API (Orders)
        app.get('/orders', async (req, res) => {
            const cursor = await ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        })

        //GET Single Package (To place order)
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        })

        //POST API (Orders)
        app.post('/orders', async (req, res) => {
            const order = req.body;

            console.log('hit the post api', order);

            const result = await ordersCollection.insertOne(order);
            console.log(result);
            res.json(result);

        });

        //GET API (My Order by email)
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const orders = await ordersCollection.find(query).toArray();
            res.json(orders);
        })

        //DELETE API (delete order)
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            console.log('delete order', id);
            res.json(1);
        })

        //DELETE API (delete product)
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            console.log('delete product', id);
            res.json(1);
        })

        //UPDATE API (update order status)
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updateOrder = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updateOrder.status
                }
            }
            console.log('hitting update', id);
            const result = await ordersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
            console.log(result);
            // const filter = {_id: ObjectId(id)};

        })

        //POST API (Review)
        app.post('/review', async (req, res) => {
            const order = req.body;

            console.log('hit the post api', order);

            const result = await reviewCollection.insertOne(order);
            console.log(result);
            res.json(result);

        });

        //GET API (Review)
        app.get('/reviews', async (req, res) => {
            const cursor = await reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })



    }
    finally {
        // await client.close();
    }

}
run().catch(console.dir)



app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`listening at${port}`)
})