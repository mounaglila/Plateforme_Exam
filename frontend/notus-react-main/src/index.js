import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/styles/tailwind.css";

// layouts

import Admin from "layouts/Admin.js";
import Auth from "layouts/Auth.js";

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      {/* add routes with layouts */}
      <Route path="/admin" component={Admin} />
      <Route path="/auth" component={Auth} />
      {/* default entry */}
      <Redirect exact from="/" to="/auth/login" />
      {/* add redirect for unknown pages */}
      <Redirect from="*" to="/auth/login" />
    </Switch>
  </BrowserRouter>,
  document.getElementById("root")
);
