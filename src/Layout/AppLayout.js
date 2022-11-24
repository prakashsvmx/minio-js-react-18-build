import React, { Fragment } from "react";
import Header from "../Layout/Header";
import AppBody from "../Layout/AppBody";
import Footer from "../Layout/Footer";

const AppLayout= ({
   children
}) =>{

        return (
          <Fragment>
          <Header/>
            <div className="flex  p-5 flex-1 mb-10" >
            <AppBody>
              {children}
            </AppBody>
            </div>
            <Footer/>

          </Fragment>

        );
}

export default AppLayout