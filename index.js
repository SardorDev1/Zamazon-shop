const express = require('express');
const app = express();
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 4000;
app.use(cors())
if(process.env.NODE_ENV !== "production"){
    require("dotenv").config({path : ".env"});
}


const Public_key = process.env.STRIPE_PUBLIC_KEY;
const Secret_key = process.env.STRIPE_SECRET_KEY;
const error_404 = process.env.errors;

const fs = require('fs');

app.set('view engine',"ejs")
app.use(express.json());
app.use(express.static('public'))
const stripe = require('stripe')(Secret_key);


app.get('/store',(req,res)=>{
    fs.readFile('data.json',(e , data)=>{
      if(e) {
          res.status(500).end()
      }
      else{
        res.render('store.ejs',{
            Public_key : Public_key,
            data: JSON.parse(data),
        })
      }
})
})
app.post("/purchase", function (req, res) {
  fs.readFile("data.json", function (e, data) {
    if (e) {
      res.status(500).end();
    } else {
      const itemsJson = JSON.parse(data);
      const itemsArray = itemsJson.mens.concat(itemsJson.women);
      let total = 0;
      req.body.items.forEach(function (item) {
        const itemJson = itemsArray.find(function (i) {
          return i.id == item.id;
        });
        total = total + itemJson.price * item.quantity;
      });

      stripe.charges
        .create({
          amount: total,
          source: req.body.stripeTokenId,
          currency: "usd",
        })
        .then(function () {
          console.log("Charge Succesfully");
          res.json({ message: "Succesfully purchased items" });
        })
        .catch(function () {
    console.log('Change Failed');
          res.status(500).end();
        });
    }
  });
});


app.listen(port, () => console.log("Server has been started on port 5000..."));
