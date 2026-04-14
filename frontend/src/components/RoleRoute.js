import React from "react";
import { Route, Redirect } from "react-router-dom";

function getAuth() {
  try {
    return JSON.parse(localStorage.getItem("auth") || "{}");
  } catch {
    return {};
  }
}

export default function RoleRoute({ component: Component, allowedRoles = [], ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) => {
        const auth = getAuth();
        const token = auth?.token;
        const role = auth?.user?.role;

        if (!token) return <Redirect to="/auth/login" />;
        if (!allowedRoles.includes(role)) return <Redirect to="/auth/login" />;

        return <Component {...props} />;
      }}
    />
  );
}