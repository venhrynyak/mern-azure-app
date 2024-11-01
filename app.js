const express = require("express")
const path = require("path")
const { MongoClient, ObjectId } = require("mongodb")
const app = express()
const PORT = 8000

const URL =
  "mongodb+srv://vitalik:1qaz!QAZ@cars.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000"
const mongoClient = new MongoClient(URL)

const jsonParser = express.json()

app.use(express.static(`${__dirname}/public`))

app.get("/api/products", async (req, res) => {
  const collection = req.app.locals.collection
  const products = await collection.find().toArray()
  res.json(products)
})

app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params

  const collection = req.app.locals.collection

  const objectId = new ObjectId(id)

  const product = await collection.findOne({ _id: objectId })

  res.json(product)
})

app.post("/api/products", jsonParser, async (req, res) => {
  const { name, price } = req.body

  const collection = req.app.locals.collection

  const product = { name, price }

  await collection.insertOne(product)
  res.json(product)
})

app.put("/api/products/:id", jsonParser, async (req, res) => {
  const { id } = req.params
  const { name, price } = req.body

  const collection = req.app.locals.collection

  const objectId = new ObjectId(id)

  const product = await collection.findOneAndUpdate(
    {
      _id: objectId
    },
    {
      $set: {
        name,
        price
      }
    },
    {
      returnDocument: "after"
    }
  )

  res.json(product)
})

app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params

  const collection = req.app.locals.collection

  const objectId = new ObjectId(id)

  const product = await collection.findOneAndDelete({ _id: objectId })

  res.json(product)
})

// Перенаправлення інших запитів на index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

const main = async () => {
  try {
    await mongoClient.connect()
    console.log("Connected to MongoDB")

    app.locals.collection = mongoClient.db("productsdb").collection("products")

    app.listen(PORT, () => {
      console.log(`Server is listening on ${PORT} port`)
    })
  } catch (err) {
    return console.log(err)
  }
}

main()

process.on("SIGINT", async () => {
  await mongoClient.close()
  process.exit()
})
