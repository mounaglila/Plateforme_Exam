import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import AdminDashboard from "views/admin/AdminDashboard";
import UsersAdmin from "views/admin/UsersAdmin";
import EnrollmentAdmin from "views/admin/EnrollmentAdmin";
import ReportsAdmin from "views/admin/ReportsAdmin";
import ExamsAdmin from "views/admin/ExamsAdmin";
import AuditAdmin from "views/admin/AuditAdmin";
import AnnouncementsAdmin from "views/admin/AnnouncementsAdmin";

export default function Admin() {
  return (
    <div className="relative bg-blueGray-100 min-h-screen">
      <Switch>
        <Route path="/admin/dashboard" exact component={AdminDashboard} />
        <Route path="/admin/users" exact component={UsersAdmin} />
        <Route path="/admin/enrollment" exact component={EnrollmentAdmin} />
        <Route path="/admin/reports" exact component={ReportsAdmin} />
        <Route path="/admin/exams" exact component={ExamsAdmin} />
        <Route path="/admin/audit" exact component={AuditAdmin} />
        <Route path="/admin/announcements" exact component={AnnouncementsAdmin} />
        <Redirect from="/admin/settings" to="/admin/dashboard" />
        <Redirect from="/admin/tables" to="/admin/dashboard" />
        <Redirect from="/admin" to="/admin/dashboard" />
      </Switch>
    </div>
  );
}
