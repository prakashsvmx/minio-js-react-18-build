import {useLocation, useParams} from "react-router-dom";
import ListObjects from "./ListObjects";
import React from "react";

const BrowsePath = ()=>{


    const {
        bucketName,
    } = useParams()

    const { search } = useLocation();

    const params = new URLSearchParams(search)

    const prefixPath = params.get("path")

    // console.log("Path::",bucketName, prefixPath)

    return <ListObjects key="browse-path" bucketName={bucketName} path={`${prefixPath}`} ref={null} />
}

export default BrowsePath