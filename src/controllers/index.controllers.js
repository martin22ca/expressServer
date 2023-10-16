const { Pool } = require('pg');
//netifly

const pool = require('../db')
pool.connect();

const hom = async(req,res) => {
    res.send("Api is Working")
}

module.exports = {
    hom,
}