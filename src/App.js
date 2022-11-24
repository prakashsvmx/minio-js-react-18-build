import React from "react";

import history from "./history";
import { Router, Route, Switch } from "react-router";
import ListBuckets from "./ListBuckets";
import BrowseBucket from "./BrowseBucket";
import AppLayout from "./Layout/AppLayout";
import "./App.css"
import ListObjects from "./cmp/ListObjects";
import { useParams } from "react-router-dom";

const BrowsePath = ()=>{


  const {
    bucketName,
    prefixPah
  } = useParams()


  console.log(bucketName, prefixPah)

  return <ListObjects bucketName={bucketName} path={prefixPah} ref={null} />
}

const App = () => {
  return (
    <Router history={history}>
    <AppLayout>
        <Switch>
          <Route exact path={["/", "/buckets"]} component={ListBuckets} />
          <Route exact path={["/buckets/:bucketName"]} component={BrowseBucket} />
          <Route exact path={["/buckets/:bucketName/:prefixPath"]} component={BrowsePath} />
        </Switch>
    </AppLayout>
    </Router>
  );
};

export default App;
