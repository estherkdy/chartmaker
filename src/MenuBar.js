/*
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

const MenuBar = (props) => {
  const [anchorElFile, setAnchorElFile] = useState(null);
  // toggle state for showing dialog for new file name (for new and save as options)
  const [newOpen, setNewOpen] = useState(false);
  // determines whether we're calling save or new after submitting a new file name
  const [save, setSave] = useState(false);
  // toggle state for load file dialog 
  const [loadOpen, setLoadOpen] = useState(false);

  const openFile = Boolean(anchorElFile);
  const handleClickFile = (event) => {
    setAnchorElFile(event.currentTarget);
  };
  const handleCloseFile = () => {
    setAnchorElFile(null);
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
          <Typography variant="h6" component="div" align="center"
            width="100%">
            Project 1
          </Typography>
          <NewFile
            open={newOpen}
            handleCloseFile={save ? handleSaveAsClose : handleNewClose}
          />
          <LoadFile
            open={loadOpen}
            handleCloseFile={handleLoadClose}
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
                  Object.keys(localStorage).map((key, i) => (
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
