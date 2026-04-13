import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/styles/tailwind.css";

import Auth from "layouts/Auth";
import Admin from "layouts/Admin";
import Professor from "layouts/Professor";
import Student from "layouts/Student";
import RoleRoute from "components/RoleRoute";
import HomePage from "views/auth/HomePage";

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route exact path="/" component={HomePage} />
      <Route path="/auth" component={Auth} />
      <RoleRoute path="/admin" allowedRoles={["admin"]} component={Admin} />
      <RoleRoute path="/professor" allowedRoles={["professor", "admin"]} component={Professor} />
      <RoleRoute path="/student" allowedRoles={["student"]} component={Student} />
      <Redirect exact from="/" to="/auth/login" />
      <Redirect from="*" to="/" />
    </Switch>
  </BrowserRouter>,
  document.getElementById("root")
);