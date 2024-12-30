/* 
* Editor JavaScript source code
*
* Author: Esther Kim
* Version: 1.0
*/
import './Editor.css';
import { useState } from 'react';
import { Button, TextField } from '@mui/material/';


 // styling objects
const editor_style = {
  item_style: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  textfield_style: {
    my: '8px',
    mx: '2%',
    maxWidth: '250px',
    width: '40%',
  },
  button_style: {
    fontSize: 15,
    minWidth: 'unset',
    width: '50px',
  },
}

// Editor component that receives props for managing title, labels, and data
const Editor = (props) => {
  const { title, setTitle, setLabels, labels, data, setData } = props;
  const [x, setX] = useState("");
  const [y, setY] = useState("");

  // changing data fields dynamically by index and key. the handler copies current data, updates the specific entry, then updates data state 
  const dataChangeHandler = (index, key, newData) => {
    const updatedData = data.slice(); 
    updatedData[index][key] = newData;
    setData(updatedData);
  };

  // handler for adding new x and y values to the data list
  const addHandler = () => {
    const newData = { x, y }; // new data objects
    setData([...data, newData]); // adding the new data object to existing array

    // resets the x and y fields
    setX("");
    setY("");
  };


  // deletes a data entry by its index in the data array
  const deleteHandler = index => {
    const updatedData = [...data];
    updatedData.splice(index, 1); // removing the object at that specified index
    setData(updatedData);
  };

  return (
    <div className="Editor">

      {/* the first row containing x and y input fields and add button */}
      <div>
        <TextField
          value={x}
          onChange={e => setX(e.target.value)}
          label={"x-value"}
          size={'small'}
          sx={{ ...editor_style.textfield_style }}
        />
        <TextField
          value={y}
          onChange={e => setY(e.target.value)}
          label={"y-value"}
          size={'small'}
          sx={{ ...editor_style.textfield_style }}
        />
        <Button
          disabled={x === '' || y === ''}
          onClick={() => addHandler(x, y)}
          sx={
            {
              ...editor_style.button_style, border: 2,
              backgroundColor: 'rgb(25, 117, 210)',
              borderColor: 'rgb(25, 117, 210)',
              color: 'white',
              fontWeight: 'bold',
              mt: 1,
              '&:disabled': {
                borderColor: 'lightgray',
                backgroundColor: 'lightgray', // Gray background indicating a disabled button
                color: 'white',  
                cursor: 'not-allowed', 
                opacity: 0.6,  
              }
            }
          }
        >{'ADD'}</Button>

      </div>

      {/* the second row containing field for the title */}
      <div>
        <TextField
          value={title}
          onChange={e => setTitle(e.target.value)}
          label={"Title"}
          size={'small'}
          sx={{ ...editor_style.textfield_style }}
        />

      </div>

      <div>
        <TextField
          value={labels[0]}
          onChange={e => setLabels([e.target.value, labels[1]])}
          label={"x-label"}
          size={'small'}
          sx={{ ...editor_style.textfield_style }}
        />
        <TextField
          value={labels[1]}
          onChange={e => setLabels([labels[0], e.target.value])}
          label={"y-label"}
          size={'small'}
          sx={{ ...editor_style.textfield_style }}
        />
      </div>
      <div>
        Data:
      </div>

      {/* mapping over data array to render each entry */}
      <div className='data-group'>
        {data.map((datum, i) =>
          <div key={'datum ' + i}>
            <TextField
              value={datum.x}
              onChange={e => dataChangeHandler(i, 'x', e.target.value)}
              size={'small'}
              sx={{ ...editor_style.textfield_style }}
            />
            <TextField
              value={datum.y}
              onChange={e => dataChangeHandler(i, 'y', e.target.value)}
              size={'small'}
              sx={{ ...editor_style.textfield_style }}
            />
            <Button
              onClick={() => deleteHandler(i)}
              sx={
                {
                  ...editor_style.button_style, border: 2,
                  backgroundColor: 'rgb(25, 117, 210)',
                  borderColor: 'rgb(25, 117, 210)',
                  color: 'white',
                  fontWeight: 'bold',                  mt: 1
                }
              }
            >{'DEL'}</Button>

          </div>
        )}

      </div>
    </div>

  );
};
export default Editor; 