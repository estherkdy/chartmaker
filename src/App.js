/*
* Author: Esther Kim
* Version: 1.0
*/

import './App.css';
import React, { useState, useEffect } from 'react';
import Item from './Item.js';
import MenuBar from './MenuBar';
import BarChart from './BarChart';
import { Box, Container } from "@mui/system";
import Editor from './Editor';
import './load.js';


const App = (props) => {
  // name of current file
  const [file, setFile] = useState('');
  // data from most recently loaded file
  const [dataFile, setDataFile] = useState({});
  // current state of form data (title, data, labels)
  const [formData, setFormData] = useState({});
  const [hasMounted, setHasMounted] = useState(false);

  const {
    data,
    title,
    labels
  } = formData; // deconstruct form data

  // construct full form data from individual setters
  const setData = newData => {
    setFormData({
      ...formData,
      data: newData
    });
  };
  const setTitle = newTitle => {
    setFormData({
      ...formData,
      title: newTitle
    });
  };
  const setLabels = newLabels => {
    setFormData({
      ...formData,
      labels: newLabels
    });
  };

  // whenever a new data file is loaded, update the form data state to match it
  useEffect(() => {
      if (!hasMounted) {
          // This block runs on mount
          // load pr1.json for initial state
          const initialDataFile = JSON.parse(localStorage.getItem('pr1.json'));
          setFile('pr1.json');
          setDataFile(initialDataFile);
          setFormDataFromDatafile(initialDataFile)
          setHasMounted(true); // Set the mounted flag
      } else {
          // This block runs on updates
          setFormDataFromDatafile(dataFile)
      }
  }, [dataFile]); // Runs when data file changes (i.e. after load/new are selected)

  // formats the data from the given file to the form data format
  const setFormDataFromDatafile = newDataFile => {
    const fileData = newDataFile.data;
    const fileLabels = newDataFile.data.length > 0 ? Object.keys(newDataFile.data[0]) : ["", ""];
    setFormData({
      data: dataWithoutLabels(fileData, fileLabels),
      title: newDataFile.title,
      labels: fileLabels,
    });
  };

  // form data format uses x and y as data keys, so user can freely edit labels without breaking the data
  const dataWithoutLabels = (currData, currLabels) => currData.slice().map(datum => ({
      x: datum[currLabels[0]],
      y: datum[currLabels[1]],
    }));
  // change back from form data format to file data format
  // if labels are empty, use x and y as default labels
  // if y label is the same as x, use y as default
  // empty/duplicate keys would break the object and/or saved json
  const dataWithLabels = (currData, newLabels) => currData.slice().map(datum => ({
    [newLabels[0].length > 0 ? newLabels[0] : "x"]: datum.x,
    [(newLabels[1].length > 0 && newLabels[1] !== newLabels[0]) ? newLabels[1] : "y"]: datum.y,
  }));

  // save form data in file format
  const handleSave = () => {
    const labeledData = dataWithLabels(data, labels);
    localStorage.setItem(file, JSON.stringify({title, data: labeledData}));
  };
  // set new file name and load empty file
  const handleNew = (fileName) => {
    setFile(fileName);
    setDataFile({
      title: "",
      data: []
    });
  };
  // load file with given file name
  const handleLoad = (fileName) => {
    const fileData = JSON.parse(localStorage.getItem(fileName)); 
    setFile(fileName);
    setDataFile(fileData);
  };
  // set new file name and save form data in file format with that name
  const handleSaveAs = (fileName) => {
    setFile(fileName);
    const labeledData = dataWithLabels(data, labels);
    localStorage.setItem(fileName, JSON.stringify({ title, data: labeledData }));
  };
  
  return (
    <Container className="App" >
      <MenuBar
        handleSave={handleSave}
        handleNew={handleNew}
        handleLoad={handleLoad}
        handleSaveAs={handleSaveAs}
      />
      <div className='filename'>
        {file}
      </div>
      { formData.data &&
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }} >
          <Item> 
          <Editor
          title={title}
          setTitle={setTitle}
          data={data}
          setData={setData}
          labels={labels}
          setLabels={setLabels}
          >

          </Editor>
          </Item> 

          <Item>
            <BarChart
              title={title}
              labels={labels}
              data={data}
              min={0}
              dataset={data}
              sx={{ bgcolor: 'white', width: '100%', height: '100%' }}
            >
            </BarChart>
          </Item>
        
        </Box>
      }
    </Container>
  );
}
export default App;
