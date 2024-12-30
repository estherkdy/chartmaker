/*
 * Project 2 
 * app back-end JavaScript code
 *
 * Author: Esther Kim
 * Version: 1.0
 */

// Import modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// Set the web server
const app = express(); 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.get(
  "/",
  (req, res) => res.send("<h1>Backend connection working</h1>") // Home web page
);

const username = encodeURIComponent("student");
const password = encodeURIComponent("cs3744");

// MongoDB connection URL
const url = `mongodb+srv://${username}:${password}@cs3744.n8tac.mongodb.net/CS3744?retryWrites=true&w=majority`;

// Set mongoose's Promise to global Promise
mongoose.Promise = global.Promise;

// Connect to MongoDB database
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// On successful connection
mongoose.connection.once("open", function () {
  console.log("Connection with MongoDB was successful");
});

// Error handling for connection issues
mongoose.connection.on("error", function (err) {
  console.error("Error connecting to MongoDB:", err);
});

// Create routes for database access
const CS3744Schema = require("./model");
const router = express.Router();
app.use("/db", router);

router.route("/find").get(async (req, res) => {
  const response = await CS3744Schema.find(); 
  return res.status(200).json(response);
});

 


// update appended by the MongoDB document id
router.route("/update/:id").post(async (req, res) => {
  const updatedItem = await CS3744Schema.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true, // returns modified document
    }
  );
  res.status(200).json(updatedItem);
});

app.get('/api/fileNames', async (req, res) => {
  try {
    // Find all documents but only return the fileName field
    const fileNames = await CS3744Schema.find({}, 'fileName');

    // Extract the fileName values from the returned documents
    const fileNamesList = fileNames.map(file => file.fileName);

    res.status(200).json(fileNamesList);  // Return the list of fileNames
  } catch (error) {
    console.error('Error fetching file names:', error);
    res.status(500).json({ message: 'Error fetching file names', error: error });
  }
});

app.get('/db/find/:fileName', async (req, res) => { 
  const { fileName } = req.params;
  try {
    const dataset = await CS3744Schema.findOne({ fileName }); 
    if (dataset) {
      res.json(dataset);   
    } else {
      res.status(404).json({ message: 'Dataset not found' });
    }
  } catch (error) {
    console.error('Error: ', error.message);  // Log any errors
    res.status(500).json({ message: error.message });
  }
});
 

// Save data to MongoDB
app.post('/api/saveData', async (req, res) => {
  const { fileName, title, data } = req.body;

  try {
    CS3744Schema.findOneAndUpdate(
      { fileName }, // searches the file name to save
      {  
        fileName,
        "dataset.title": title,
        "dataset.data": data,
      },
      { new: true, upsert: true } // upsert will create a file if none was found
    )
      .then(updatedDataFile => {
        console.log('Updated DataFile:', updatedDataFile);
        res.status(200).json(updatedDataFile);
      })
      .catch(err => {
        console.log('Error:', err);
      });
  } catch (err) {
    res.status(500).json({ message: 'Error saving data', error: err });
  }
});

 
 

// Export the app to be used in bin/www.js
module.exports = app;