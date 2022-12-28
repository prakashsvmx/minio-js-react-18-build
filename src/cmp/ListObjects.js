import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { TreeTable } from "primereact/treetable";
import { Column } from "primereact/column";
import mc from "../util/mc";
import prettyBytes from "pretty-bytes";
import { orderBy } from "lodash";
import history from "../history";

const getAsNode = (objectInfo) => {

  const {
    name = "",
    pathName,
    displayKey,
    leaf,
    children,
    size,
    ...dataKeys
  } = objectInfo;


  return {
    key: `${pathName}/${name}`,
    data: {
      ...dataKeys,
      name: displayKey,
      size: size > 0 ? prettyBytes(size) : ""
    },
    leaf: leaf,
    children: children
  };

};

const listObjectsOfPrefix = (bName, pathName, keyPrefix = "") => {

  return new Promise((resolve, reject) => {

    let objList = [];
    try {
      const objectsStream = mc.extensions.listObjectsV2WithMetadata(bName, pathName, false, "");
      objectsStream.on("data", async (chunk) => {

        const { name: objectName = "", prefix } = chunk;

        //TODO Start After.
        //const displayPathName = objectName.indexOf("/") !== -1 ? objectName.substring(pathName.lastIndexOf("/") + 1) : objectName;
        const displayPathName = objectName.indexOf("/") !== -1 ? objectName.substring(pathName.lastIndexOf("/") ) : objectName;
        let nodeInfo;
        if (!prefix) {
          nodeInfo = getAsNode({
            ...chunk,
            name: objectName,
            displayKey: displayPathName,
            leaf: true,
            pathName: `${keyPrefix}`
          });
        } else {
          let displayPrefix = prefix.substring(0, prefix.length - 1);
          displayPrefix = displayPrefix.indexOf("/") !== -1 ? displayPrefix.substring(pathName.length - 1) : displayPrefix;
          nodeInfo = getAsNode({
            ...chunk,
            name: prefix,
            displayKey: displayPrefix,
            children: null,
            leaf: false,
            pathName: `${keyPrefix}`
          });
        }

        if (nodeInfo) {
          objList.push(nodeInfo);
        }
      });
      objectsStream.on("error", (err) => {
        reject([]);
      });
      objectsStream.on("end", () => {


        resolve(objList);
      });

    } catch (err) {
      console.log("Error in list objects", err);

      reject([]);
    }


  });

};


const ListObjects = forwardRef((props, ref) => {
  const { bucketName, path, onDelete } = props;

  const [objects, setObjects] = useState([]);

  const [loading, setLoading] = useState(false);

  const loadObjectList = async (bucketName, path) => {
    let objList = await listObjectsOfPrefix(bucketName, path);

    let sortedList = orderBy(objList, ["leaf", "name"], ["asc", "desc"]);

    setObjects((prev = []) => {
      return [...prev, ...sortedList];
    });

  };


  useImperativeHandle(ref, () => ({
    refresh(b=bucketName,p=path) {
      loadBucketObjects(b, p);
    },
    refreshChildren(evt) {
      onExpand(evt);
    },
  }));

  const loadBucketObjects = (bucketName, path) => {
    setObjects([]);
    loadObjectList(bucketName, path);
  };


  useEffect(() => {
    loadBucketObjects(bucketName, path);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucketName, path]);


  const openPreView = (path) =>{

    setLoading(true)
    let file
    let countChunks=0
    mc.getObject(bucketName, path, function(err, dataStream) {
      if (err) {
        console.log("err", err);
      }
      dataStream.on("data", function(chunk) {

        console.log(chunk)
        countChunks+=1
        file = new Blob([chunk], { type: "application/pdf" });
      });
      dataStream.on("end", function() {
        setLoading(false)
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, "_blank");
        console.log("Opening Preview", countChunks);
        URL.revokeObjectURL(fileURL)

      });
      dataStream.on("error", function(err) {
        console.log(err);
      });
    });
  }

  const openPreviewWithSignedUrl = async (path) =>{
    setLoading(true)
    const signedUrl = await mc.presignedGetObject(bucketName, path)
    setLoading(false)
    window.open(signedUrl, "_blank");
  }

  const onExpand = async (event) => {

    if (!event.node.children) {
      const {
        node: {
          key: nodePath
        } = {}
      } = event;

      history.push(`/buckets/${bucketName}?path=${nodePath.substring(0,nodePath.length)}`)
    }
  };

  const rowClassName = (node) => {
    return { "p-highlight": false,"object-tree-row":true };
  };


  const actionTemplate = (node, column) => {

    let fileType = "";
    if (node?.data?.metadata?.Items?.length) {
      //let fileType=""
      const {
        Value: mimeType = ""
      } = node?.data?.metadata?.Items.find((mt) => {
        return mt.Key === "content-type";
      }) || {};

      fileType = mimeType;
    }
    return <div className="flex gap-2">
      <button type="button" className="bg-white hover:bg-gray-200 flex items-center p-1 rounded"  onClick={()=>{
        onDelete?.({node:node})
      }
      }>
        <i className=" pi pi-trash"></i>
      </button>
      {node.leaf?null: <button type="button" className="bg-white hover:bg-gray-200 flex items-center p-1 rounded"  onClick={()=>{
        let path=node.key
        history.push(`/buckets/${bucketName}?path=${path.substring(0,path.length)}`)
      }
      }>
        <i className=" pi pi-window-maximize"></i>
      </button>
      }
      {fileType?  <button type="button" className="bg-white hover:bg-gray-200 flex items-center p-1 rounded"  onClick={()=>{
       openPreView(node.key)
      }
      }>
        <i className=" pi pi-download"></i>
      </button>:null}

      {fileType?  <button type="button" className="bg-white hover:bg-gray-200 flex items-center p-1 rounded"  onClick={()=>{
        openPreviewWithSignedUrl(node.key)
      }
      }>
        <i className=" pi pi-link"></i>
      </button>:null}
    </div>;
  }




  return (
    <TreeTable
      className="object-tree-table"
      value={objects} lazy onExpand={onExpand} loading={loading}
      scrollable
      rowClassName={rowClassName}
    >
      <Column field="name" header="Name" expander></Column>
      <Column field="type" header="Details" style={{ width: "200px" }} body={(rowData) => {
        let fileType = "";
        if (rowData?.data?.metadata?.Items?.length) {
          //let fileType=""
          const {
            Value: mimeType = ""
          } = rowData?.data?.metadata?.Items.find((mt) => {
            return mt.Key === "content-type";
          }) || {};

          fileType = mimeType;
        }

        const lmd = rowData.data.lastModified;
        const date = lmd ? new Date(rowData.data.lastModified).toLocaleString() : "";

        return <div className="flex flex-col ">
          <div className="flex gap-2"><span className="text-sm">{rowData.data.size}</span><span className=" text-sm">{fileType}</span></div>
          <div className="text-sm">{date}</div>
        </div>;

      }}></Column>

      <Column body={actionTemplate} style={{ textAlign: 'center', width: '100px' }} />


    </TreeTable>
  );
});
export default ListObjects;