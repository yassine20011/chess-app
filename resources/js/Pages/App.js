import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import MatchStarted from "./Game/MatchStarted";
// ...other imports...

function App() {
    return (
        <Router>
            <Switch>
                {/* ...other routes... */}
                <Route path="/game/:id" component={MatchStarted} />
                {/* ...other routes... */}
            </Switch>
        </Router>
    );
}

export default App;
