import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// views
import StudentDashboard from "views/Student/Dashboard.js";

export default function Student() {
  return (
    <div className="relative bg-blueGray-100 min-h-screen">
      <div className="px-4 md:px-10 mx-auto w-full pt-10">
        <Switch>
          <Route path="/student/dashboard" exact component={StudentDashboard} />
          <Redirect from="/student" to="/student/dashboard" />
        </Switch>
      </div>
    </div>
  );
}