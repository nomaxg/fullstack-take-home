/*
Simple navigation bar that contains a "home" button, a "logout" button, and 
the logged in username
*/
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import CourseApi from "../utils/CourseApi.js";
import { getUser, logout } from "../utils/AuthHelper.js";
import Button from "@material-ui/core/Button";

function Navbar() {
  const history = useHistory();
  const [username, setUsername] = useState("");

  useEffect(() => {
    async function fetchData() {
      const username = await CourseApi.get("/username/" + getUser());
      setUsername(username.data);
    }
    fetchData();
  }, []);

  return (
    <div class="Navbar">
      <h3>Logged in as: {username}</h3>
      <div>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            logout();
            history.push("/");
          }}
        >
          Logout
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            history.push("/");
          }}
        >
          Home
        </Button>
      </div>
    </div>
  );
}

export default Navbar;
