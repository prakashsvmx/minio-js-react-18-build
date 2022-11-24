import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { TreeTable } from "primereact/treetable";
import { Column } from "primereact/column";
import mc from "../mc";
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

        const displayPathName = objectName.indexOf("/") !== -1 ? objectName.substring(pathName.lastIndexOf("/") + 1) : objectName;
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

  const loadChildren = async (bucketName, path, keyPrefix) => {
    let objList = await listObjectsOfPrefix(bucketName, `${path}`, keyPrefix);
    let sortedList = orderBy(objList, ["leaf", "name"], ["asc", "desc"]);
    return sortedList;

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
  }, [bucketName, path,ref]);


  const onExpand = async (event) => {

    if (!event.node.children) {
      const {
        node: {
          key: nodePath
        } = {}
      } = event;
      setLoading(true);

      setLoading(false);
      let lazyNode = { ...event.node };
      const children = await loadChildren(bucketName, nodePath);

      lazyNode.children = children;

      let update = (id, children) => obj => {
        if (obj.key === id) {
          obj.children = children;
          return true;
        } else if (obj.children)
          return obj.children.some(update(id, children));
      };

      const segments = nodePath.split("/");
      const topLevelKey = `/${segments[1]}/`;// e.g: /TestPrefix/
      const topLevelNode = objects.find((o) => o.key === topLevelKey);
      if (topLevelNode) {
        objects.forEach(update(nodePath, children));
      }

      let _nodes = objects.map(node => {
        if (node.key === segments[0]) {
          node = topLevelNode;
        }
        return node;
      });

      setLoading(false);
      setObjects(_nodes);

    }
  };

  const rowClassName = (node) => {
    return { "p-highlight": false,"object-tree-row":true };
  };


  const actionTemplate = (node, column) => {
    return <div className="flex gap-2">
      <button type="button" className="bg-white hover:bg-gray-200 flex items-center p-1 rounded"  onClick={()=>{
      console.log(node)
        onDelete?.({node:node
        })
      }
      }>
        <i className=" pi pi-trash"></i>
      </button>
      {node.leaf?null: <button type="button" className="bg-white hover:bg-gray-200 flex items-center p-1 rounded"  onClick={()=>{
        console.log(node)

        let path=node.key

        console.log("::Path::",path)
        history.push(`/browse/${bucketName}?view=${path.substring(0,node.key.length)}`)
      }
      }>
        <i className=" pi pi-window-maximize"></i>
      </button>}
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
          <div className="flex gap-2"><span className="text-sm">{rowData.data.size}</span><span className="hidden text-sm">{fileType}</span></div>
          <div className="text-sm">{date}</div>
        </div>;

      }}></Column>

      <Column body={actionTemplate} style={{ textAlign: 'center', width: '80px' }} />


    </TreeTable>
  );
});
export default ListObjects;