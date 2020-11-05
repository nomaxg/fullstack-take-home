import React, { useState, useEffect } from "react";
import "./App.css";
import CourseList from "./components/CourseList.js";
import Login from "./components/Login.js";
import { useLocation } from "react-router-dom";
import CourseView from "./components/CourseView.js";
import { isAuthenticated } from "./utils/AuthHelper.js";
import { Switch, BrowserRouter, Route, Redirect } from "react-router-dom";

// Component that redirects to another route if a condition is met.
// Inspired by https://reactrouter.com/web/example/auth-workflow
function RedirectRoute(props) {
  const { children, condition, redirectPath, ...rest } = props;
  return (
    <Route
      {...rest}
      render={({ location }) =>
        condition ? (
          <Redirect
            to={{
              pathname: redirectPath,
              state: { from: location },
            }}
          />
        ) : (
          children
        )
      }
    />
  );
}

function LocationListener({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    async function fetchData() {
      const newAuthenticated = await isAuthenticated();
      setAuthenticated(newAuthenticated);
    }
    fetchData();
  }, [location]);

  return (
    <Switch>
      <RedirectRoute path="/login" condition={authenticated} redirectPath={"/"}>
        <Login />
      </RedirectRoute>
      <RedirectRoute
        path="/course/:courseId"
        condition={!authenticated}
        redirectPath={"/login"}
      >
        <CourseView />
      </RedirectRoute>
      <RedirectRoute
        path="/"
        condition={!authenticated}
        redirectPath={"/login"}
      >
        <CourseList />
      </RedirectRoute>
    </Switch>
  );
}

function App() {
  return (
    <div class="App">
      <BrowserRouter>
        <LocationListener />
      </BrowserRouter>
    </div>
  );
}

export default App;
