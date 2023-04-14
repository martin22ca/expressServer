//archivo que inicia el server
const express = require('express');
const cookieParser = require('cookie-parser')
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

app.use((err, req, res, next) => {
    return res.json({
        message: err.message
    });
});

// Settings
app.set("port", process.env.PORT || 3001);

app.listen(app.get("port"),'0.0.0.0');
console.log("Server on port", app.get("port"));

