import React, { useEffect, useState } from "react";
import mc from "./mc";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

const ListBuckets = () => {

  const [buckets, setBuckets] = useState([]);

  const getBuckets = async () => {
    const res = await mc.listBuckets();
    setBuckets(res);
  };

  useEffect(() => {
    getBuckets();
  }, []);

  const bucketsTableHeader=() => {
    return (
      <div className="flex justify-content-between align-items-center">
        <h5 className="m-0">Buckets</h5>
      </div>
    )
  }


  return (
      <div className="flex flex-1">
      <DataTable value={buckets}   width="100%" style={{flex:1, border:"1px solid #CECEEC" , borderRadius:"5px"}} header={bucketsTableHeader}>
        <Column field="name"  width={"80%"} header="Name" body={(rowData)=>{
          return <a className="text-pink-700 underline hover:text-blue-800" href={`/buckets/${rowData.name}`} rel="noopener">{rowData.name} </a>;

        }}/>
        <Column field="creationDate" header="Created At" style={{width:"220px"}} body={(rowData=>{
          return <span>
            {new Date(rowData.creationDate).toLocaleString()}
          </span>
        })}></Column>

      </DataTable>
      </div>

  );
};

export default ListBuckets;