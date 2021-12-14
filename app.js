const express = require("express");
const app = express();
const port = process.env.port || 3000;
// C O N N E C T   D B
require("dotenv").config();
const connectDB = require("./db/connect");
//E X P R E S S   A S Y N C   E R R O R S  - npm i express-async-errors
require("express-async-errors");
const productsRoutes = require("./routes/products");
const notFoundMiddleware = require("./middleware/not-found");
const errorMiddleware = require("./middleware/error-handler");

app.use(express.json());

// R O U T E S
app.get("/", (req, res, next) => {
  res.send("<h1>Store API</h1>");
});
app.use("/api/v1/products", productsRoutes);

// M I D D L E W A R E
app.use(notFoundMiddleware);
app.use(errorMiddleware);

const start = async () => {
  try {
    //C O N N E C T   D B
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log("Listening on port 3000"));
  } catch (error) {
    console.log(error);
  }
};

start();
