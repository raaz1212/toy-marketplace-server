const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nvqqk2a.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toysCollection = client.db("toysDB").collection("toys");

    app.get("/toys", async (req, res) => {
      const { sort } = req.query;
      const sortOptions = {};

      if (sort === "asc") {
        sortOptions.price = 1; // Sort in ascending order
      } else if (sort === "desc") {
        sortOptions.price = -1; // Sort in descending order
      }

      const cursor = toysCollection.find().sort(sortOptions);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/toys/:id", async (req, res) => {
      try {
        const toys = await toysCollection.findOne({
          _id: new ObjectId(req.params.id),
        });

        if (!toys) {
          res.status(404).send("Toy not found");
          return;
        }

        res.send(toys);
      } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.get("/my-toys/:email", async (req, res) => {
      try {
        const toys = await toysCollection
          .find({
            sellerEmail: req.params.email,
          })
          .toArray();

        if (toys.length === 0) {
          res.status(404).send("No toys found for the given email");
          return;
        }

        res.send(toys);
      } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.get("/toys/:id", async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          res.status(400).send("Invalid ID");
          return;
        }

        const query = { _id: new ObjectId(id) };
        const result = await toysCollection.findOne(query);

        if (!result) {
          res.status(404).send("Toy not found");
          return;
        }

        res.send(result);
      } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.post("/toys", async (req, res) => {
      const newToys = req.body;
      console.log(newToys);
      const result = await toysCollection.insertOne(newToys);
      res.send(result);
    });

    app.put("/toys/:id", async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        res.status(400).send("Invalid ID");
        return;
      }

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const newToys = req.body;

      const toy = {
        $set: {
          price: newToys.price,
          quantity: newToys.quantity,
          description: newToys.description,
        },
      };

      try {
        const result = await toysCollection.updateOne(filter, toy, options);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      try {
        const result = await toysCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("runninggggggggggggg");
});

app.get("/toy/:id", (req, res) => {
  const id = req.params.id;
  res.send(`Toy Details for ID: ${id}`);
});

app.listen(port, () => {
  console.log(`running on port: ${port}`);
});
