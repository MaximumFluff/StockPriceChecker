/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const mongoose = require('mongoose');
const StockController = require('../controllers/stockHandler.js');

mongoose.connect(process.env.DB, {useNewUrlParser: true});
mongoose.set('useFindAndModify', false);

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(async function (req, res){
      const Controller = new StockController();
      const ip = req.ip;
      const like = req.query.like ? req.query.like : false;
      if (!Array.isArray(req.query.stock)) {
        const stock = req.query.stock.toUpperCase();
        const value = await Controller.checkDatabase(stock, like, ip);
        if (value) {
          const { price, likes } = value;
          res.json({
            stockData: {
              stock,
              price,
              likes,
            }
          });
        }
      }
      else if (Array.isArray(req.query.stock)) {
        const stock = req.query.stock;
        const first = await Controller.checkDatabase(stock[0].toUpperCase(), like, ip);
        const second = await Controller.checkDatabase(stock[1].toUpperCase(), like, ip);
        if (first && second) {
          res.json({
            stockData: [
              {
                stock: first.stock,
                price: first.price,
                rel_likes: first.likes - second.likes,
              },
              {
                stock: second.stock,
                price: second.price,
                rel_likes: second.likes - first.likes,
              }
            ]
          })
        }
      }
    })
}