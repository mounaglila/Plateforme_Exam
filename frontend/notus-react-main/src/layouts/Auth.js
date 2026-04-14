import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import Login from "views/auth/Login.js";
import Register from "views/auth/Register.js";

export default function Auth() {
  return (
    <main>
      <Switch>
        <Route path="/auth/login" exact component={Login} />
        <Route path="/auth/register" exact component={Register} />
        <Redirect from="/auth" to="/auth/login" />
      </Switch>
    </main>
  );
}