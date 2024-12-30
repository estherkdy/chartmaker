/*
 * App component JavaScript source code
 *
 * Author: Esther Kim
 * Version: 1.0
 */

import "./App.css";
import React, { useState, useEffect } from "react";
import Item from "./Item.js";
import MenuBar from "./MenuBar";
import BarChart from "./BarChart";
import { Box, Container } from "@mui/system";
import Editor from "./Editor"; 
import axios from "axios";
import ScatterPlot from "./ScatterPlot";
import PieChart from "./PieChart";
 
const App = (props) => {
  // name of current file
  const [file, setFile] = useState("");
  // data from most recently loaded file
  const [dataFile, setDataFile] = useState({});
  // current state of form data (title, data, labels)
  const [formData, setFormData] = useState({});
  const [hasMounted, setHasMounted] = useState(false);
  // filenames from backend
  const [filenames, setFilenames] = useState([]);
  // array of indices for selected data items
  const [selectedItems, setSelectedItems] = useState([]);
  // data items stored in clipboard
  const [clipboard, setClipboard] = React.useState([]);
  // previous data state for undo
  const [oldData, setOldData] = React.useState([]);
  const { data, title, labels } = formData; // deconstruct form data
 

  // construct full form data from individual setters
  const setData = (newData) => {
    setFormData({
      ...formData,
      data: newData,
    });
  };
  const setTitle = (newTitle) => {
    setFormData({
      ...formData,
      title: newTitle,
    });
  };
  const setLabels = (newLabels) => {
    setFormData({
      ...formData,
      labels: newLabels,
    });
  };

  // whenever a new data file is loaded, update the form data state to match it
  useEffect(() => {
    if (!hasMounted) {
      // This block runs on mount
      // Make the HTTP requests using axios
      updateFileNameList();
      axios
        .get("http://localhost:3000/db/find/pr2.json")
        .then((response) => {
          const initialDataFile = response.data.dataset;
          setFile("pr1.json");
          setDataFile(initialDataFile);
          setFormDataFromDatafile(initialDataFile);
          setHasMounted(true); // Set the mounted flag
        })
        .catch((error) => {
          console.error("Error loading data file:", error);
        });
    } else {
      // This block runs on updates (if dataFile changes)
      setFormDataFromDatafile(dataFile);
    }
  }, [dataFile]); // Runs when data file changes (i.e. after load/new are selected)

  // gets the list of files from the backend
  const updateFileNameList = () => {
    axios
      .get("http://localhost:3000/api/fileNames")
      .then((response) => {
        setFilenames(response.data);
      })
      .catch((error) => {
        console.error("Error fetching file names:", error);
      });
  };

  // formats the data from the given file to the form data format
  const setFormDataFromDatafile = (newDataFile) => {
    const fileData = newDataFile.data;
    const fileLabels =
      newDataFile.data.length > 0 ? Object.keys(newDataFile.data[0]) : ["", ""];
    setFormData({
      data: dataWithoutLabels(fileData, fileLabels),
      title: newDataFile.title,
      labels: fileLabels,
    });
  };

  // form data format uses x and y as data keys, so user can freely edit labels without breaking the data
  const dataWithoutLabels = (currData, currLabels) =>
    currData.slice().map((datum) => ({
      x: datum[currLabels[0]],
      y: datum[currLabels[1]],
    }));
  // change back from form data format to file data format
  // if labels are empty, use x and y as default labels
  // if y label is the same as x, use y as default
  // empty/duplicate keys would break the object and/or saved json
  const dataWithLabels = (currData, newLabels) =>
    currData.slice().map((datum) => ({
      [newLabels[0].length > 0 ? newLabels[0] : "x"]: datum.x,
      [newLabels[1].length > 0 && newLabels[1] !== newLabels[0]
        ? newLabels[1]
        : "y"]: datum.y,
    }));

  // save form data in file format
  const handleSave = () => {
    const labeledData = dataWithLabels(data, labels);
    axios
      .post("http://localhost:3000/api/saveData", {
        fileName: file,
        title: title,
        data: labeledData,
      })
      .then((response) => {
        updateFileNameList();
      })
      .catch((error) => {
        console.error("Error saving data:", error);
      });
  };

  // set new file name and load empty file
  const handleNew = (fileName) => {
    setFile(fileName);
    setDataFile({
      title: "",
      data: [],
    });
    setSelectedItems([]);
    setOldData([]);
  };

  // load file with given file name
  const handleLoad = (fileName) => {
    axios
      .get(`http://localhost:3000/db/find/${fileName}`)
      .then((response) => {
        const initialDataFile = response.data.dataset;
        setFile(fileName);
        setDataFile(initialDataFile);
        setFormDataFromDatafile(initialDataFile);
        setHasMounted(true); // Set the mounted flag
        setSelectedItems([]);
        setOldData([]);
      })
      .catch((error) => {
        console.error("Error loading data file:", error);
      });
  };

  // set new file name and save form data in file format with that name
  const handleSaveAs = (fileName) => {
    setFile(fileName); // Update the file name before saving
    const labeledData = dataWithLabels(data, labels);
    axios
      .post("http://localhost:3000/api/saveData", {
        fileName: fileName, // Use the new file name
        title: title,
        data: labeledData,
      })
      .then((response) => {
        updateFileNameList();
      })
      .catch((error) => {
        console.error("Error saving data:", error);
      });
  };

  const handleChartClick = (index) => {
    let newSelectedItems = [];
    // data selection is a toggle, so we remove the item if it's already selected, else add it
    if (selectedItems.includes(index)) {
      newSelectedItems = selectedItems.filter((i) => i !== index);
    } else {
      newSelectedItems = [...selectedItems, index];
    }
    setSelectedItems(newSelectedItems);
  };

  return (
    <Container className="App">
      <MenuBar
        handleSave={handleSave}
        handleNew={handleNew}
        handleLoad={handleLoad}
        handleSaveAs={handleSaveAs}
        filenames={filenames}
        clipboard={clipboard}
        setClipboard={setClipboard}
        oldData={oldData}
        setOldData={setOldData}
        data={data}
        setData={setData}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
      />
      <div className="filename">{file}</div>
      {formData.data && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)", 
            gridTemplateRows: "repeat(2, 1fr)",  
            gap: 1,  
            height: "50vh",  
            width: "100%", 
            padding: 0, 
            boxSizing: "border-box",  
          }}
        >
          <Item>
            <Editor
              title={title}
              setTitle={setTitle}
              data={data}
              setData={setData}
              labels={labels}
              setLabels={setLabels}
            ></Editor>
          </Item>
          { data.length > 0 && // component hidden until data is added
            <Item>
              <BarChart
                title={title}
                labels={labels}
                data={data}
                min={0}
                dataset={data}
                sx={{ bgcolor: "white", width: "100%", height: "100%" }}
                selectedItems={selectedItems}
                handleClick={handleChartClick}
              />
            </Item>
          }

          { data.length > 0 &&  // component hidden until data is added
            <Item>
              <PieChart
                title={title}
                labels={labels}
                data={data}
                selectedItems={selectedItems}
                handleClick={handleChartClick}
              />
            </Item>
          }

          { data.length > 0 &&  // component hidden until data is added
            <Item>
              <ScatterPlot
                title={title}
                labels={labels}
                data={data}
                min={0}
                dataset={data}
                sx={{ bgcolor: "white", width: "100%", height: "100%" }}
                selectedItems={selectedItems}
                handleClick={handleChartClick}
              />
            </Item>
          }
        </Box>
      )}
    </Container>
  );
};
export default App;
