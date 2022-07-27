import React, {useEffect, useState} from "react"
import mc from "./mc";
const ListBuckets = () => {

    const [buckets, setBuckets] = useState([]);

    const getBuckets = async () => {
        const res = await mc.listBuckets();
        setBuckets(res);
    };

    useEffect(() => {
        getBuckets();
    }, []);

   

    return (
        <div className="container mx-auto mt-5 ">

            <div className="flex items-start justify-between mb-2">
                <div>
                <h2>List of Buckets </h2>
                </div>

                <button  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" >
                    Create Bucket
                </button>
            </div>

                <div className="flex flex-col border border-gray-100  p-5">
                <table className="table-fixed">
                    <thead>
                    <tr className="text-purple-700">
                        <th className="text-left w-16">S.No</th>
                        <th className="text-left ">Bucket Name</th>
                    </tr>
                    </thead>
                    <tbody>
                    {buckets.map((bucket, index) => {
                        return (<tr key={bucket.name}  className=" border border-gray-100">
                                <td className="p-2">{index + 1}</td>
                                <td>
                                    <a href={`/list-objects/${bucket.name}`} className={"text-green-500 hover:underline"}>{bucket.name}</a>
                                </td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
            </div>
        </div>)
}

export default ListBuckets