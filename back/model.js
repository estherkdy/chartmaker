/*
 * Project 2
 * model JavaScript code
 *
 * Author: Esther Kim 
 * Version: 1.0
 */
// Import mongoose library
const mongoose = require("mongoose");
// Create schema
const CS3744Schema = new mongoose.Schema({
  fileName: String,
  dataset: {
    type: Object,
    properties: { 
      title: String,
      data: {
        type: Array,
        items: {
          type: Object,
        },
      },
    },
  },
});
// Export schema
module.exports = mongoose.model("CS3744Schema", CS3744Schema, "Datasets");