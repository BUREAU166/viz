import { Button, TextField, CircularProgress, Box, Typography } from '@mui/material/'
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import './style.css'
import styled from '@emotion/styled';
import { useLegexContext } from '../context/LegexContext';
import { useEffect, useState } from 'react';
import ControlledExpansion from './TreeView'

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
        'Access-Control-Allow-Origin': '*'
      }
    })
      .then(
        res => {
          console.log("sending", file)
          console.log(res)
        }
      )
  }

  // Use lastClickedItem for API call to backend, lastClickedItem is a relative path to the choosen file
  const [lastClickedItem, setLastClickedItem] = useState<string | null>(null);
  const handleLastClickedItemChange = (itemId: string | null) => {
    setLastClickedItem(itemId);
  };

  // TODO(Change this when we can get treeView.json from backend)
  function loadAndRenderTreeView() {
    const [jsonString, setJsonString] = useState<string | null>(null);
    const [loadingError, setLoadingError] = useState<boolean>(false);

    useEffect(() => {
      // Here (or not here) should be response handling from backend, now I have mocked this in treeView.json in project root
      fetch('../treeView.json')
        .then((response) => response.json())
        .then((data) => {
          setJsonString(JSON.stringify(data));
          setLoadingError(false);
        })
        .catch((error) => {
          console.error("Ошибка загрузки JSON:", error);
          setLoadingError(true);
        });
    }, []);

    if (loadingError) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="30vh"
        >
          <Typography color="textSecondary">
            Failed to load project. Please upload your project to view the tree structure.
          </Typography>
        </Box>
      );
    }

    if (jsonString) {
      return <ControlledExpansion
      // Artem: Pass treeView json here
        jsonStructureString={jsonString}
        onLastClickedItemChange={handleLastClickedItemChange}
      />;
    }

    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const onSearch = (funcName: string) => {
    var currInfo = context.userInfo
    currInfo.funcName = funcName
    context.setUserInfo(currInfo)
    console.log("new use info => ", currInfo)
  }

  return (
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
          startIcon={<CloudUploadIcon />}
        >
          Upload files
          <VisuallyHiddenInput
            type="file"
            onChange={(event) => onUpload(event.target.files[0])}
            multiple
          />
        </Button>
      </div>
      <div>
        {loadAndRenderTreeView()}
      </div>
    </div>
  )
}

export default ControlPanel