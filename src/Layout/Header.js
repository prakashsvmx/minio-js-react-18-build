import React from "react";

const  Header = (props) =>{

    return(
        <header className=" w-full h-16  drop-shadow-lg bg-pink-800 text-white ">
            <div className="container px-4 md:px-0 h-full mx-auto flex justify-between items-center">
                <div>MinIO JS APIs Demo</div>

                <ul id="menu" className="hidden fixed top-0 right-0 px-10 py-16 bg-gray-800 z-50
                md:relative md:flex md:p-0 md:bg-transparent md:flex-row md:space-x-6">

                    <li>
                        <a className="text-white opacity-70 hover:opacity-100 duration-300" href="/">Buckets</a>
                    </li>

                </ul>


            </div>

        </header>
    )
}

export default Header