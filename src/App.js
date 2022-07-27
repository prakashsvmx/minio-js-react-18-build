import React from "react"
import history from "./history";
import {Router, Route, Switch} from "react-router";
import './App.css';
import ListBuckets from './ListBuckets';
import ListObjects from './ListObjects';

function App() {
  return (
    <div className="App">
  
  <Router history={history}>
            <Switch>
                <Route exact path={["/","list-buckets"]} component={ListBuckets}/>
                <Route exact path={["/list-objects/:bucketName"]} component={ListObjects}/>
            </Switch>
        </Router>
        
    </div>
  );
}

export default App;
