import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import ProfessorDashboard from "views/Professor/Dashboard";
import CreateExam from "views/Professor/CreateExam";
import ExamDetails from "views/Professor/ExamDetails";
import ExamSubmissions from "views/Professor/ExamSubmissions";

export default function Professor() {
  return (
    <div className="relative bg-blueGray-100 min-h-screen">
      <div className="px-4 md:px-10 mx-auto w-full pt-10">
        <Switch>
          <Route path="/professor/dashboard" exact component={ProfessorDashboard} />
          <Route path="/professor/exams/new" exact component={CreateExam} />
          <Route path="/professor/exams/:id" exact component={ExamDetails} />
          <Route path="/professor/exams/:id/submissions" exact component={ExamSubmissions} />
          <Redirect from="/professor" to="/professor/dashboard" />
        </Switch>
      </div>
    </div>
  );
}