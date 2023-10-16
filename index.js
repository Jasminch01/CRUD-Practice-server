const express = require ('express');
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json())

const USER = process.env.DB_USER;
const USERPASS = process.env.DB_PASS;

const uri = `mongodb+srv://${USER}:${USERPASS}@cluster0.nkafzub.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    
    const database = client.db("usersDB");
    const userCollection = database.collection("users");

    app.get('/users', async(req, res) => {
      
        const cursor = userCollection.find();
        const result = await cursor.toArray();
        res.send(result)
    })

    app.get('/users/:id' , async(req, res) => {

        const id = req.params.id;
        const query = new ObjectId(id);

        const result = await userCollection.findOne(query);

        res.send(result)
    })
    
    app.post('/users', async(req, res) => {
        const users = req.body;
        console.log('new user', users)
        const result = await userCollection.insertOne(users)

        res.send(result)
    })
    
    app.put('/users/:id', async (req, res) => {
        const id = req.params.id;
        const update = req.body;

        const fiter = {_id : new ObjectId(id)}
        const options = {upsert: true};

        const updateUser = {
            $set : {
                name : update.name,
                email : update.email
            }
        }

        const result = await userCollection.updateOne(fiter, updateUser, options);

        res.send(result)

        console.log('update user, ', update)
    })

    app.delete('/users/:id', async(req, res) => {
        const id = req.params.id;
        console.log('delete this is' , id);

        const query = {_id : new ObjectId(id)}

        const result = await userCollection.deleteOne(query)

        res.send(result)
    })
    
    await client.db("admin").command({ ping: 1 });

    // Send a ping to confirm a successful connection
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/' , (req, res ) => {
    res.send('simple crud server is running')
})

app.listen(port, () => {
    console.log(`server rinning port ${port}`)
})