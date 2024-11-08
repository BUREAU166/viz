import { Button, TextField, CircularProgress, Box, Typography } from '@mui/material/'
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import './style.css'
import styled from '@emotion/styled';
import { useLegexContext } from '../context/LegexContext';
import { useEffect, useState } from 'react';
import ControlledExpansion from './TreeView'
import { parseDotFile } from '../utils';

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

  const [jsonString, setJsonString] = useState<string | null>(null);
  const [loadingError, setLoadingError] = useState<boolean>(false);

  const [graphDot, setGraphDot] = useState<string>("")

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
      console.log("NEW FILE ", file.name)
      setFileMem(formatBytes(file.size))
      setUploadedFile(file)
      console.log("uploaded", file.name, "with size", fileMem, " | ", formatBytes(file.size), " | ", file.size)

      var currInfo = context.info
      currInfo.dirName = file.name.replace(/\.[^/.]+$/, "")
      
      context.setUserInfo(currInfo)
      console.log("new use info => ", currInfo)
    }
    finally {
      isZipFile(file) ? handleUploadProject(file) : handleUploadFile(file)
    }
  }

  function isZipFile(file: File): boolean {
    return file.type === 'application/zip' || file.name.toLowerCase().endsWith('.zip');
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
          mockJsonString()
        }
      )
  }

  const handleAnalyze = async () => {
    var chunks 
    console.log("funcName ", context.info.funcName, " dir ", context.info.dirName)
    var status = await fetch(`http://localhost:5000/analyze?func_name=${context.info.funcName}&file_name=${context.info.dirName}`)
    .then(
      res => res.text()
    )
    .then(
      async data => {
        console.log(data)
        setGraphDot(data)
        //parseDotFile(dotFilePath).then((graphJson) => {
        // console.log(JSON.stringify(graphJson, null, 2));
        //});
        var gJ = await parseDotFile(data)
        var parsed = JSON.stringify(gJ, null, 2);
        console.log("PARSED", parsed)
        context.prepareGraph(JSON.parse(parsed) as GraphData)
        //setJsonString(parsed)
        //setLoadingError(false);
        //setJsonString(parsed)
      }
    )
    // .then((response) => {
    //   const reader = response.body.getReader();
    //   // read() returns a promise that resolves when a value has been received
    //   reader.read().then(function pump({ done, value }) {
    //     if (done) {
    //       chunks += value
    //       return;
    //     }
    //     chunks += value
    //     console.log(chunks)
    //     // Read some more, and call this function again
    //     return reader.read().then(pump);
    //   });
    // })

    
  }

  function mockJsonString() { 
    useEffect(() => {
      // Here (or not here) should be response handling from backend, now I have mocked this in treeView.json in project root
      fetch('../treeView.json')
          .then((response) => response.json())
          .then((data) => {
            setJsonString(JSON.stringify(data));
            setLoadingError(false);
          })
          .catch((error) => {
            console.error("Error on treeView json loading:", error);
            setLoadingError(true);
          });
    }, []);
  }

  const handleUploadProject = async (file: File) => {
    //const [jsonString, setJsonString] = useState<string | null>(null);
    var data = new FormData()
    console.log("ZIP ? ", file.name)

    data.append('file', file)
    var status = await fetch(`http://localhost:5000/upload_project`, {
      method: 'POST',
      body: data,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    })
        .then(
            res => res.json()
        )
        .then(
          data => {
            console.log(data)
            setJsonString(JSON.stringify(data))
          }
        )
  }

  // Use lastClickedItem for API call to backend, lastClickedItem is a relative path to the choosen file
  const [lastClickedItem, setLastClickedItem] = useState<string | null>(null);
  const handleLastClickedItemChange = (itemId: string | null) => {
    setLastClickedItem(itemId)
    var currInfo = context.info

    // currInfo.dirName = currInfo.dirName.match(/(.*)[\/\\]/)[1]||'';

    if(lastClickedItem) {
      currInfo.dirName = lastClickedItem
      console.log(" -- new info", currInfo.dirName)
      context.setUserInfo(currInfo)
    }
  };

  // TODO(Change this when we can get treeView.json from backend)
  function loadAndRenderTreeView() {
    //const [jsonString, setJsonString] = useState<string | null>(null);
    //const [loadingError, setLoadingError] = useState<boolean>(false);

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
    console.log("old info => ", context.info)
    var currInfo = context.info
    currInfo.funcName = funcName
    context.setUserInfo(currInfo)
    console.log("new use info => ", context.info)
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
          style={{ width: "50%" }}
          disabled={!lastClickedItem} // Disable the search if the file is not selected
        />
        {!lastClickedItem && (
          <Typography variant="body1" color="textSecondary" sx={{ mt: 0 }}>
            Please select a file to search a function.
          </Typography>
        )}
        <Button
          style={{ height: "40%" }}
          variant="contained"
          color="success"
          onClick={() => handleAnalyze()}
        >
          Analyze
        </Button>
        <Button
          style={{ height: "40%" }}
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
