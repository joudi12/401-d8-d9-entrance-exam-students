'use strict';
// -------------------------
// Application Dependencies
// -------------------------
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');

// -------------------------
// Environment variables
// -------------------------
require('dotenv').config();
const HP_API_URL = process.env.HP_API_URL;

// -------------------------
// Application Setup
// -------------------------
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended: true }));

// Application Middleware override
app.use(methodOverride('_method'));

// Specify a directory for static resources
app.use('/public',express.static('./public'));
app.use(express.static('./img'));

// Database Setup

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

// Set the view engine for server-side templating

app.set('view engine', 'ejs');


// ----------------------
// ------- Routes -------
// ----------------------
app.get('/home',homepage);
app.get('/house_name', caractersPage);
app.post('/my-characters',addToFav);
app.get('/my-characters', showTheFav);
app.get('/character/:id', showDetails);
app.put('/character/:id',handelUpdateing);
app.delete('/character/:id',handeldeleting);
// --------------------------------
// ---- Pages Routes functions ----
// --------------------------------


function handeldeleting(req,res){
    let query='DELETE FROM harry WHERE id=$1;'
    let values=[ req.params.id];
    client.query(query,values).then(()=>{
        res.redirect(`/my-characters`);
    });
}


function handelUpdateing(req,res){
    let query='UPDATE harry SET name=$1,patronus=$2,alive=$3 WHERE id=$4;'
    let values=[req.body.name,req.body.patronus, req.body.alive, req.params.id];
    client.query(query,values).then(()=>{
        res.redirect(`/character/${req.params.id}`);
    });
}

function showDetails(req,res){
    let query = 'SELECT * FROM  harry WHERE id= $1;';
    let values=[req.params.id];
    client.query(query,values).then(val=>{
        res.render('details',{result:val.rows[0]});
    });
}

function showTheFav(req,res){
    let query = 'SELECT * FROM  harry;';
    client.query(query).then(val=>{
        res.render('favorite',{result:val.rows});
    });
}

function addToFav(req,res){
    let query='INSERT INTO harry (name, patronus, alive)VALUES($1,$2,$3);';
    let values=[req.body.name,req.body.patronus, req.body.alive];
    client.query(query,values).then(()=>{
        res.redirect('/my-characters');
    });
}


function homepage(req,res){
  res.render('home');
}

function caractersPage (req,res){
  let array=[];
  let url= `http://hp-api.herokuapp.com/api/characters/house/${req.query.house}`;
  console.log(url);
  superagent(url).then(val=>{
    val.body.forEach(val=>{
      array.push(new Caracter(val) );
    });
    res.render('caracter',{result:array});
  });
}


function Caracter(value){
  this.name=value.name || 'No name available';
  this.patronus=value.patronus || 'No patronus available';
  this.image=value.image || 'No image available';
  this.alive=value.alive || 'No alive available';

}
// -----------------------------------
// --- CRUD Pages Routes functions ---
// -----------------------------------



// Express Runtime

client.connect().then(() => {
  app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
}).catch(error => console.log(`Could not connect to database\n${error}`));
