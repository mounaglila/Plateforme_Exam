import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import StudentDashboard from "views/Student/Dashboard";
import TakeExam from "views/Student/TakeExam";
import MySubmissions from "views/Student/MySubmissions";
import StudentExams from "views/Student/Exams";

export default function Student() {
  return (
    <div className="relative bg-blueGray-100 min-h-screen">
      <div className="px-4 md:px-10 mx-auto w-full pt-10">
        <Switch>
          <Route path="/student/dashboard" exact component={StudentDashboard} />
          <Route path="/student/exams" exact component={StudentExams} />
          <Route path="/student/exams/:id" exact component={TakeExam} />
          <Route path="/student/submissions" exact component={MySubmissions} />
          <Redirect from="/student" to="/student/dashboard" />
        </Switch>
      </div>
    </div>
  );
}