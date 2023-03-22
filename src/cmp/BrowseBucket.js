import React, {Fragment, useRef} from "react";
import {useLocation, useParams} from "react-router-dom";
import UploadFile from "./UploadFile";
import ListObjects from "./ListObjects";
import mc from "../util/mc"
import {Toast} from "primereact/toast";


const BrowseBucket = () => {

    const {bucketName} = useParams();


    const {search} = useLocation();

    const params = new URLSearchParams(search)

    const prefixPath = params.get("path") || "/"


    //console.log(":::",bucketName, prefixPath,restParams);

    const childRef = useRef(null);
    const toast = useRef(null);

    const showSuccess = (summary = "", detail = "") => {
        toast.current.show({severity: 'success', summary: summary, detail: detail, life: 3000});
    }
    const showError = (summary = "", detail = "") => {
        toast.current.show({severity: 'error', summary: summary, detail: detail, life: 3000});
    }


    const refreshObjectList = () => {
        if (childRef.current) {
            childRef.current.refresh();
        }
    }


    const onDelete = async (event) => {

        const {
            node: {
                key: objectName,

            }
        } = event

        try {
            await mc.removeObject(bucketName, objectName)
            showSuccess(`Successfully deleted ${objectName}`)

        } catch (err) {
            showError(`Error deleting ${objectName}`)
        }

        refreshObjectList()

    }


    return (
        <Fragment>
            <div className="flex gap-2 flex-col ">
                <div className="flex flex-col border border-gray-200 rounded border-b-0">
                    <div className="flex items-center justify-between p-3 gap-5 ">
                        <div className="flex items-center gap-2 ">
                            <a href="/buckets" className="border border-gray-200 p-1 rounded flex items-center"
                               aria-label="Back">
                                <i className="pi pi-angle-left"></i>
                            </a>
                            <i className="ml-3 pi pi-server"></i>
                            <div className="">Objects in</div>
                            <div className="text-pink-800">{bucketName}</div>
                        </div>

                        <UploadFile bucketName={bucketName} onRefresh={refreshObjectList}/>
                    </div>

                    <ListObjects bucketName={bucketName} path={prefixPath} ref={childRef} onDelete={onDelete}/>
                </div>
            </div>

            <Toast ref={toast}/>
        </Fragment>
    );
};

export default BrowseBucket;