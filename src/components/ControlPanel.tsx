import { Button, TextField } from '@mui/material/'
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import './style.css'
import styled from '@emotion/styled';
import { useLegexContext } from '../context/LegexContext';
import { useState } from 'react';

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
  
  const context = useLegexContext();

  const [stdOut, cetStdOut] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [fileMem, setFileMem] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  } 

  const onUpload = (file: File) => {
    try {
      setFileName(file.name)
      setFileMem(formatBytes(file.size))
      setUploadedFile(file)
      console.log("uploaded", file.name, "with size", fileMem, " | ", formatBytes(file.size), " | ", file.size)
  
      var currInfo = context.userInfo
      currInfo.dirName = file.name
      context.setUserInfo(currInfo)
      console.log("new use info => ", currInfo)
    }
    finally {
      handleUploadFile(file)
    }
  }

  const handleUploadFile = async (file: File) => {
    var data = new FormData()
    data.append('file', file)
    var status = await fetch(`http://localhost:5000/upload`, {
      method: 'POST',
      body: data,
      headers: {
        'Access-Control-Allow-Origin':'*'
      }
    })
    .then(
      res => { 
        console.log("sending", file)
        console.log(res)
      }
    )
  }

  const onSearch = (funcName: string) => {
    var currInfo = context.userInfo
    currInfo.funcName = funcName
    context.setUserInfo(currInfo)
    console.log("new use info => ", currInfo)
  }

  return(
    <div className="controls">
      <div className='bar'>
        <TextField 
          id="outlined-basic" 
          label="Search" 
          variant="outlined" 
          placeholder='myFavoriteFunction()...'
          onChange={(event) => onSearch(event.target.value)}
        />
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
            onChange={(event) => onUpload(event.target.files[0])}
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