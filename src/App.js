import React from "react";

import history from "./history";
import { Router, Route, Switch } from "react-router";
import ListBuckets from "./cmp/ListBuckets";
import BrowseBucket from "./cmp/BrowseBucket";
import AppLayout from "./Layout/AppLayout";
import "./App.css"
import BrowsePath from "./cmp/BrowsePath";


const App = () => {
  return (
    <Router history={history}>
    <AppLayout>
        <Switch>
          <Route exact path={["/", "/buckets"]} component={ListBuckets} />
          <Route exact path={["/buckets/:bucketName"]} component={BrowseBucket} />
        </Switch>
    </AppLayout>
    </Router>
  );
};

export default App;
