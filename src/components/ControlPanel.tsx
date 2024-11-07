import { Button } from '@mui/material/'
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import './style.css'
import styled from '@emotion/styled';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const ControlPanel = () => {
  return(
    <div className="controls">
      <div className='bar'>
        <a>Function name</a>
        <Button variant="contained" color="success">Analyze</Button>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon/>}
        >
          Upload files
          <VisuallyHiddenInput
            type="file"
            onChange={(event) => console.log(event.target.files)}
            multiple
          />
        </Button>
      </div>
      <div className='view'>
        <a>Goodbye</a>
      </div>
    </div>
  )
}

export default ControlPanel