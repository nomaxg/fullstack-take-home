import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { login } from "../utils/AuthHelper.js";
import CardContent from "@material-ui/core/CardContent";
import { cardStyle } from "../styles/CardStyles.js";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";

// Simple login form
function Login() {
  const classes = cardStyle();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      history.push("/");
    } catch (e) {
      alert("Invalid username and/or password");
    }
  };

  const invalidInput = username.length == 0 || password.length == 0;

  return (
    <div>
      <h1>Welcome!</h1>
      <Grid
        container
        spacing={10}
        direction="column"
        style={{ padding: 50 }}
        alignItems="center"
        justify="center"
      >
        <Card className={classes.root}>
          <CardContent>
            <TextField
              error={invalidInput}
              label="Username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </CardContent>
          <CardContent>
            <TextField
              error={invalidInput}
              label="Password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </CardContent>
          <CardContent>
            <Button disabled={invalidInput} onClick={handleSubmit}>
              {" "}
              Log In / Sign up
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </div>
  );
}

export default Login;
