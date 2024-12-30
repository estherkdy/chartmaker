/*
* MenuBar JavaScript source code
*
* Author: Esther Kim
* Version: 1.0
*/ 
import React, { useState } from "react";
import {
  AppBar,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  ListItem,
  ListItemButton,
  ListItemText,
  List
} from '@mui/material';
import axios from "axios";

const MenuBar = (props) => {
  const [anchorElFile, setAnchorElFile] = useState(null); /// toggle state for the file button 

  const [anchorElEdit, setAnchorElEdit] = useState(null); // toggle state for the edit button 

  // toggle state for showing dialog for new file name (for new and save as options)
  const [newOpen, setNewOpen] = useState(false);
  // determines whether we're calling save or new after submitting a new file name
  const [save, setSave] = useState(false);
  // toggle state for load file dialog 
  const [loadOpen, setLoadOpen] = useState(false);

  const { clipboard, setClipboard, oldData, setOldData, selectedItems, setSelectedItems, data, setData } = props;

  
  const openFile = Boolean(anchorElFile);
  const openEdit = Boolean(anchorElEdit);

 
  const handleClickFile = (event) => {
    setAnchorElFile(event.currentTarget);
  };
  const handleCloseFile = () => {
    setAnchorElFile(null);
  };

  const handleClickEdit = (event) => {
    setAnchorElEdit(event.currentTarget);
  };
  const handleCloseEdit = () => {
    setAnchorElEdit(null);
  };


  const handleCopy = () => {
    const copiedItems = selectedItems.map((index) => data[index]);
    setClipboard(copiedItems);
  };

  const handleCut = () => {
    setOldData([...data]); // Save current state for undo
    const remainingData = data.filter((_, index) => !selectedItems.includes(index));
    const cutItems = selectedItems.map((index) => data[index]);
    setData(remainingData); // Update data with removed items
    setClipboard(cutItems); // Add cut items to clipboard
    setSelectedItems([]); // Clear selection after cut
  };

  const handlePaste = () => {
    if (clipboard.length > 0) {
      setOldData([...data]); // Save current state for undo
      setData([...data, ...clipboard]); // Append clipboard items to the dataset
    }
  };

  const handleUndo = () => {
    if (oldData.length > 0) {
      setData([...oldData]); // Restore old data
      setOldData([]); // Clear oldData to allow only one undo step
    }
  };



  return (
    <Box sx={{ flexGrow: 1, m: 0.5 }}>
      <AppBar position="static">
        <Toolbar>
          <Button
            id="file-button"
            aria-controls={openFile ? 'fade-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openFile ? 'true' : undefined}
            onClick={handleClickFile}
            sx={{ bgcolor: 'white', color: 'blue', m: 0.5 }}
          >
            File
          </Button>


          <Button // the edit button 
            id="edit-button" // not used yet
            aria-controls={openEdit ? 'fade-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openEdit ? 'true' : undefined}
            onClick={handleClickEdit}
            sx={{ bgcolor: 'white', color: 'blue', m: 0.5 }}
          >
            Edit
          </Button>

          
          <Menu
            id="file-menu"
            MenuListProps={{
              'aria-labelledby': 'file-button',
            }}
            anchorEl={anchorElFile}
            open={openFile}
            onClose={handleCloseFile}
          >
            {/* when menu items are clicked, their functions are called*/}
            <MenuItem id={'new'} onClick={handleNewOpen}>New</MenuItem>
            <MenuItem onClick={handleLoadOpen}>Load</MenuItem>
            <MenuItem onClick={handleSave}>Save</MenuItem>
            <MenuItem id={'saveAs'} onClick={handleNewOpen}>Save As</MenuItem>
          </Menu>


          <Menu
            id="file-menu"
            MenuListProps={{
              'aria-labelledby': 'file-button',
            }}
            anchorEl={anchorElEdit}
            open={openEdit}
            onClose={handleCloseEdit}
          >
            {/* when menu items are clicked, their functions are called*/}
            {/* need to change the onclicks and ids for cut copy paste and undo */}
            <MenuItem onClick={handleCut}>Cut</MenuItem>
            <MenuItem onClick={handleCopy}>Copy</MenuItem>
            <MenuItem onClick={handlePaste}>Paste</MenuItem>
            <MenuItem onClick={handleUndo}>Undo</MenuItem>
          </Menu>



          <Typography variant="h6" component="div" align="center"
            width="100%">
            Project 2
          </Typography>
          <NewFile
            open={newOpen}
            handleCloseFile={save ? handleSaveAsClose : handleNewClose}
          />
          <LoadFile
            open={loadOpen}
            handleCloseFile={handleLoadClose}
            filenames={props.filenames}
          />
        </Toolbar>
      </AppBar>
    </Box>
  );

  // Handle menu save click
  function handleSave() {
    // tell parent to save
    props.handleSave();
    // close menu
    handleCloseFile();
  }

  // Open the new file name dialog
  function handleNewOpen(e) {
      // set the flag for save as, so the dialog will:
      // -save after a file name is picked if true
      // -clear the file if false
      setSave(e.target.id === 'saveAs')
      // toggle the new file name dialog on
      setNewOpen(true);
      // close the menu
      handleCloseFile();
  }

  // handle new file name submission
  function handleNewClose(file, submitted) {
      // close the dialog
      setNewOpen(false);
      if (submitted) {
          // tell the parent to generate the new file
          props.handleNew(file);
      }
  } 

  // handle load file menu click
  function handleLoadOpen() {
      // open load file dialog
      setLoadOpen(true);
      // close the menu
      handleCloseFile();
  }

  // handle load file dialog submit
  function handleLoadClose(file) {
      // close the dialog
      setLoadOpen(false);
      if (file !== '') {
          // load the file if one was picked
          props.handleLoad(file);
      }
  }

  // handle save as filename submission
  function handleSaveAsClose(file, submitted) {
      // close the dialog
      setNewOpen(false);
      if (submitted) {
          // tell the parent to save with the new file name
          props.handleSaveAs(file);
      }
  }
};


// Dialog for a new file name
function NewFile(props) {
  let [file, setFile] = useState('');

  // cancel button handler
  function handleCancel() {
      props.handleCloseFile(file, false);
  };

  // submit handler
  function handleCreate() {
      // only submit if there was a name entered
      if (file !== '')
          props.handleCloseFile(file, true);
      // clear dialog input
      setFile('');
  }

  // update dialog input
  function fileName(e) {
      setFile(e.target.value)
  }

  return (
      <Dialog
          open={props.open}
          onClose={handleCancel}
          maxWidth="sm"
      >
          <DialogTitle>New</DialogTitle>
          <DialogContent>
              <TextField
                  value={file}
                  onChange={fileName}
                  margin="dense"
                  label="File Name"
                  helperText="Enter file name"
                  variant="standard"
              />
          </DialogContent>
          <DialogActions>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleCreate}>Create</Button>
          </DialogActions>
      </Dialog>
  );
}

function LoadFile(props) {
  // handle cancel
  const handleCloseFile = () => {
      props.handleCloseFile('');
  }

  // handle file name click
  const handleFileClick = (e) => {
      props.handleCloseFile(e);
  }

  return (
      <Dialog
          open={props.open}
          onClose={handleCloseFile}
          fullWidth
          maxWidth="xs"
      >
          <DialogTitle>Load</DialogTitle>
          <List sx={{ pt: 0 }}>
              {
                  props.filenames.map((key, i) => (
                      <ListItem disableGutters key={"file " + i}>
                          <ListItemButton
                              onClick={() => handleFileClick(key)}
                          >
                              <ListItemText primary={key} />
                          </ListItemButton>
                      </ListItem>
                  ))
              }
          </List>
      </Dialog>
  );
}
export default MenuBar;