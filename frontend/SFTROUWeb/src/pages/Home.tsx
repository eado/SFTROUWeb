import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonProgressBar, IonAlert } from '@ionic/react';
import React, { useCallback, useState } from 'react';
import './Home.css';

import { useDropzone } from 'react-dropzone'
import { startProcess } from '../ServerProvider';

const Home: React.FC = () => {
  let [img, setImg] = useState("");
  let [fileType, setFileType] = useState("")
  let [status, setStatus] = useState("")
  let [error, setError] = useState("")

  const [showAlert1, setShowAlert1] = useState(false);

  const onDrop = useCallback(acceptedFiles => {
    const files = acceptedFiles as File[]
    const reader = new FileReader()
    reader.readAsDataURL(files[files.length - 1])
    reader.onload = () => {
      let encoded = (reader.result as string).toString().replace(/^data:(.*,)?/, '');
      if ((encoded.length % 4) > 0) {
        encoded += '='.repeat(4 - (encoded.length % 4));
      }
      setImg(encoded)
      setFileType(files[files.length - 1].name.split(".")[1])
    }
  }, [])

  const b64toBlob = (b64Data: string, contentType='', sliceSize=512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
  
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
  
    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }

  const convert = () => {
    startProcess(data => {
      if (data.image) {
        setStatus("")
        let a = document.createElement('a')
        let blob = b64toBlob(data.image, 'image/png')
        let url = window.URL.createObjectURL(blob)
        a.href = url
        a.download = "output.png"
        document.body.appendChild(a)
        a.click()

        setTimeout(() => {
          let b = document.createElement('a')
          let blob2 = new Blob([data.thr], {type: 'text/plain'})
          let url2 = window.URL.createObjectURL(blob2)
          b.href = url2
          b.download = "output.thr"
          document.body.appendChild(b)
          b.click()
        }, 1000)
        
      } else if (data.data) {
        setStatus(data.data)
      } else if (data.error) {
        setStatus("")
        setError(data.error)
        setShowAlert1(true)
      }
    }, img, fileType)
  }

  const {getRootProps, getInputProps, isDragActive} = useDropzone({ onDrop })
  return (
    <IonPage>
      <IonAlert
          isOpen={showAlert1}
          onDidDismiss={() => setShowAlert1(false)}
          header={'Error'}
          message={error}
          buttons={['Retry']}
      />
      <IonHeader>
        <IonToolbar>
          <IonTitle>Welcome to Sisyphus for the Rest of Us</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Welcome to Sisyphus for the Rest of Us</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="container" {...getRootProps()}>
          <strong>Import an .xyz or .png file below:</strong><br /><br />
          <input {...getInputProps()} />
          {
            isDragActive ?
            <p>Drop the file here</p> :
            <><IonButton>Select a file</IonButton><p>or drag and drop</p></>
          }<br />
          { img ? <img alt="uploadedFile"src={"data:image/png;base64," + img}/> : null }
        </div>
        <IonButton className="convertButton" disabled={img === ""} onClick={convert}>Convert {status ? "(" + status.trim() + ")": null}</IonButton>
        {status !== "" && status.indexOf("%") < 0 ?
            <IonProgressBar type="indeterminate"></IonProgressBar> : null
        } 
        {status !== "" && status.indexOf("%") > -1 ?
            <IonProgressBar value={Number(status.split("%")[0]) / 100}></IonProgressBar> : null
        } 
      </IonContent>
    </IonPage>
  );
};

export default Home;
