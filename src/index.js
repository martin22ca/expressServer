//archivo que inicia el server
const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors')

const app = express();

dotenv.config();
process.env.TOKEN_SECRET;

const corsConfig = {
    credentials: true,
    origin: true,
};

// Middlewares
app.use(cors(corsConfig));
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use(require("./routes/index"));
app.use(require("./routes/admission"));
app.use(require("./routes/messages"));
app.use(require("./routes/users"));
app.use(require("./routes/roles"));
app.use(require("./routes/aiModules"));
app.use(require("./routes/grades"));
app.use(require("./routes/students"));
app.use(require("./routes/attendances"));

app.use((err, req, res, next) => {
    return res.json({
        message: err.message
    });
});

// Settings
app.set("port", process.env.EXPRESS_PORT);

app.listen(app.get("port"), '0.0.0.0');
console.log("Server on port", app.get("port"));

