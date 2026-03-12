require("dotenv").config();

const express = require("express");
const cors = require("cors");

const seedData = require("./db/seed");
const initDb = require("./db/initdb");

const reportRoutes = require("./routes/reportRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/reports", reportRoutes);

async function startServer() {

    await initDb();
    await seedData();

    app.listen(process.env.PORT, () => {
        console.log("Server running on port " + process.env.PORT)
    });

}

startServer();