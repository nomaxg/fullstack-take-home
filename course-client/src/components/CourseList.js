import React, { useState, useEffect } from "react";
import CourseApi from "../utils/CourseApi.js";
import clsx from "clsx";
import Card from "@material-ui/core/Card";
import { cardStyle } from "../styles/CardStyles.js";
import { useHistory } from "react-router-dom";
import Box from "@material-ui/core/Box";
import CardHeader from "@material-ui/core/CardHeader";
import Navbar from "./Navbar.js";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import CardGrid from "./CardGrid.js";
import CardActions from "@material-ui/core/CardActions";
import Collapse from "@material-ui/core/Collapse";
import Typography from "@material-ui/core/Typography";

// Component that shows all available courses
function CourseList() {
  const [courses, setCourses] = useState([]);
  const [sessionTitles, setSessionTitles] = useState(new Map());
  const history = useHistory();

  useEffect(() => {
    async function fetchData() {
      const courses = await CourseApi.get("/courses");
      setCourses(courses.data);

      // Fetch the session titles of each course so that users
      // can preview them
      let titles = new Map();
      for (const course of courses.data) {
        let sessionNames = await CourseApi.get(
          "/course/" + course.id + "/sessionNames/"
        );
        titles.set(course.id, sessionNames.data);
      }

      setSessionTitles(titles);
    }
    fetchData();
  }, []);

  const courseCardList = courses.map((course) => (
    <CourseCard
      name={course.name}
      description={course.description}
      img={course.imgurl}
      titles={sessionTitles.get(course.id) || []}
      onCardClick={() => history.push("/course/" + course.id)}
    />
  ));
  return (
    <div>
      <Navbar />
      <h1>Explore Courses</h1>
      <CardGrid>{courseCardList}</CardGrid>
    </div>
  );
}

// Information for a single course
function CourseCard(props) {
  const classes = cardStyle();
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const sessionNamePreview = props.titles.map((name, index) => (
    <CardContent>
      <Typography variant="caption">
        <Box fontWeight="fontWeightBold" m={1}>
          Week {index + 1}
        </Box>
      </Typography>
      <Typography variant="title">{name}</Typography>
    </CardContent>
  ));

  return (
    <Card className={classes.root}>
      <CardHeader title={props.name} />
      <CardMedia className={classes.media} image={props.img} />
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
          {props.description}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <Button onClick={props.onCardClick}>Course Info</Button>
        <Button
          className={clsx(classes.expand, {
            [classes.expandOpen]: expanded,
          })}
          onClick={handleExpandClick}
          size="small"
          aria-expanded={expanded}
          aria-label="show more"
        >
          Preview Schedule
        </Button>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        {sessionNamePreview}
      </Collapse>
    </Card>
  );
}

export default CourseList;
