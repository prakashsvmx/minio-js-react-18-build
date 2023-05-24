import React from "react";
import { useState } from "react";
import mc from "../util/mc";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from 'primereact/toast';
import useToast from "../cmp/useToast";
const superagent = require('superagent');


let fileReaderStream = require('filereader-stream')

const UploadFile = ({ bucketName, pathPrefix = "", onRefresh }) => {

  const [value, setValue] = useState([]);

  const handleChange = (event) => {
    setValue(event.target.files);
  };

  const [toast, , showSuccess] = useToast()

  // eslint-disable-next-line no-unused-vars
  const [targetPrefix, setTargetPrefix] = useState(pathPrefix);
  const [opened, setOpened] = useState(false);

  const toggleModal = () => setOpened((o) => !o);

  const uploadFiles = () => {

    const filesList = Array.from(value);
    filesList.map(async (file) => {



      const policy = mc.newPostPolicy()
      policy.setKey('browser-upload-file')
      policy.setBucket('test-bucket')
      const expires = new Date()
      expires.setSeconds(24 * 60 * 60 * 10)
      policy.setExpires(expires)

      policy.setUserMetaData({
        key: 'my-value',
        anotherKey: 'another-value',
      })

      mc.presignedPostPolicy(policy, (e, data) => {
        if (e) {
          console.log('Error...', e.message)
        }

       const request = superagent
          .post(data.postURL)

        //send all the returned information back to server

        Object.keys(data.formData).forEach((value)=>{
          request.field(value, data.formData[value])
        })
          request.attach('browser-upload-file', file)
          .then((err, res) =>{

            showSuccess(`Successfully uploaded ${file.name}`)
          });


/*
        req.end(function (e) {
          if (e) {
            console.log('Error...', e.message)
          }
          console.log('Success...')
          showSuccess(`Successfully uploaded ${file.name}`)

        })
        req.on('error', (e) => {
          console.log('Error...', e.message)
        })*/
      })


      /*
      const {
        name:fileName
      } = file

      let readStream = fileReaderStream(file )

      await mc.putObject(bucketName, `${targetPrefix ? targetPrefix : ""}${fileName}`, readStream, {
        "Content-Type": file.type,
        "X-Amz-Meta-App": "SPH-REACT-JS"
      });*/

      onRefresh?.(true)


     /* const fileReader = new FileReader();
      fileReader.onload = async function(evt) {
        if (evt.target.readyState === FileReader.DONE) {
          // Get the unsigned 8 bit int8Array (ie Uint8Array) of the 600 bytes (this looks like '[119,80,78,71...]'):
          const uint = new Uint8Array(evt.target.result);
          await mc.putObject(bucketName, `${targetPrefix ? targetPrefix : ""}${fileName}`, Buffer.from(uint), {
            "Content-Type": file.type,
            "X-Amz-Meta-App": "SPH-REACT-JS"
          });
          showSuccess(`Successfully uploaded ${fileName}`)
          onRefresh?.(true)
        }
      };
      fileReader.onerror = function() {
        fileReader.abort();
        showError(`Unable to upload file ${fileName}`)
        onRefresh?.(false)
      };
      fileReader.readAsArrayBuffer(file);*/

    });

    toggleModal();


  };


  return (
    <>
      <Toast ref={toast} />
      <Dialog header="Upload Objects" visible={opened} style={{ width: "50vw" }} onHide={() => setOpened(false)}>
        <form
          encType="multipart/form-data"
          onSubmit={(event) => {
          event.preventDefault();
          uploadFiles();

        }}>
          <div className="flex flex-col gap-3 ">


            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file"
                     className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg aria-hidden="true" className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor"
                       viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or
                    drag and drop</p>
                </div>
                <input id="dropzone-file" type="file"   multiple className="hidden" onChange={handleChange} />
              </label>
            </div>


            <div className="flex items-center justify-center">
            <button type="submit" className="h-12 bg-pink-800 border border-gray-100 w-24 text-white rounded">Upload</button>
            </div>
          </div>
        </form>
      </Dialog>
      <Button label="Upload" icon="pi pi-upload" className="p-button-outlined p-button-secondary h-3 " type="button"
              onClick={toggleModal} />


    </>
  );
};

export default UploadFile;