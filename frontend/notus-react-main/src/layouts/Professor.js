import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// views
import ProfessorDashboard from "views/Professor/Dashboard.js";

export default function Professor() {
  return (
    <div className="relative bg-blueGray-100 min-h-screen">
      <div className="px-4 md:px-10 mx-auto w-full pt-10">
        <Switch>
          <Route path="/professor/dashboard" exact component={ProfessorDashboard} />
          <Redirect from="/professor" to="/professor/dashboard" />
        </Switch>
      </div>
    </div>
  );
}