const fetch = require('node-fetch');
const Stock = require('../model.js');

module.exports = function() {
  this.fetchStock = async function(stock, like, ip) {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock}&apikey=${process.env.API_KEY}`
    const result = await fetch(url);
    const data = await result.json();
    console.log("Calling API");
    if (data) {
      const stock = data['Global Quote']['01. symbol'];
      const price = data['Global Quote']['05. price']
      const likes = like ? 1 : 0;
      await this.saveStock(stock, price, likes, ip);
      return {
        stock,
        price,
        likes,
      }
    }
    else {
      return false;
    }
  }
  this.checkDatabase = async function(stock, like, ip) {
    const value = await Stock.findOne({ stock: stock });
    if (value) {
      const ipCheck = await this.checkOrSaveNewIp(stock, ip);
      console.log("Database value found");
      console.log(ipCheck);
      if (ipCheck) {
        await Stock.updateOne({ stock: stock }, { $inc: { likes: 1 }});
      }
      return {
        stock: value.stock,
        price: value.price,
        likes: (like && ipCheck) ? (value.likes + 1) : value.likes,
      }
    }
    else {
      const value = await this.fetchStock(stock, like, ip);
      return value;
    }
  }
  this.saveStock = async function(stock, price, likes, ip) {
    const newDocument = new Stock({
      stock,
      price,
      likes,
      date_retrieved: new Date(),
      tracked_ips: [ip],
    })
    const saved = await newDocument.save();
    console.log("Saving to database");
    return saved;
  }
  this.checkOrSaveNewIp = async function(stock, ip) {
    const value = await Stock.findOne({ stock: stock });
    if (value.tracked_ips.indexOf(ip) >= 0) {
      return false;
    }
    else {
      await Stock.findOneAndUpdate({ stock: stock }, { $push: { tracked_ips: ip }});
      return true;
    }
  }
}