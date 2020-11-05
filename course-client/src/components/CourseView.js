import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { cardStyle } from "../styles/CardStyles.js";
import CourseApi from "../utils/CourseApi.js";
import { getUser } from "../utils/AuthHelper.js";
import CardGrid from "./CardGrid.js";
import Navbar from "./Navbar.js";

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import CardActions from "@material-ui/core/CardActions";
import Typography from "@material-ui/core/Typography";

// Information for a course
// If the user is signed up for a section, shows the section's released content
// and roster.
// If the user is not signed up for a section, shows a list of sections.
function CourseView(props) {
  let { courseId } = useParams();
  let userId = getUser();
  const [userSection, setUserSection] = useState(null);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const course = await CourseApi.get("/course/" + courseId);
      setCourse(course.data);
      const signups = await CourseApi.get("/course/" + courseId + "/signups");

      for (const signup of signups.data) {
        if (signup.userid === userId) {
          setUserSection(signup.sectionid);
        }
      }
    }
    fetchData();
  }, [courseId, userId]);

  const leaveSection = () => {
    setUserSection(null);
  };

  return (
    <div>
      <Navbar />
      {userSection ? (
        <SectionInformation sectionId={userSection} onLeave={leaveSection} />
      ) : (
        <div>
          <h1>Course Section Signup: {course && course.name}</h1>
          <SectionSignup setSection={setUserSection} />
        </div>
      )}
    </div>
  );
}

// Shown when the user has not yet signed up for a section.
function SectionSignup(props) {
  let { courseId } = useParams();
  const [sections, setSections] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const sections = await CourseApi.get("/course/" + courseId + "/sections");
      setSections(sections.data);
    }
    fetchData();
  }, [courseId]);

  const sectionSignUpList = sections.map((section) => (
    <SectionSignupCard
      name={section.nickname}
      dateStart={section.datestart}
      remainingSpots={10 - section.numsignups}
      onCardClick={async () => {
        await CourseApi.post("/signup", {
          userId: getUser(),
          sectionId: section.id,
        });
        props.setSection(section.id);
      }}
    />
  ));
  return <CardGrid>{sectionSignUpList}</CardGrid>;
}

function SectionSignupCard(props) {
  const dateString = new Date(props.dateStart).toLocaleDateString();
  const sectionFull = props.remainingSpots == 0;
  return (
    <Card>
      <CardHeader title={props.name} />
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
          Start date {dateString}, {props.remainingSpots} spots remaining.
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <Button onClick={props.onCardClick} disabled={sectionFull}>
          {sectionFull ? "Section Full" : "Join Section"}
        </Button>
      </CardActions>
    </Card>
  );
}

// Displays course information when the user has signed up for a section.
function SectionInformation(props) {
  let { sectionId } = props;

  // fetch content for a specific section and list of users
  const [sessions, setSessions] = useState([]);
  const [participantNames, setParticipantNames] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const sections = await CourseApi.get("/sessionsReleased/" + sectionId);
      const participants = await CourseApi.get(
        "/section/" + sectionId + "/participants"
      );
      setParticipantNames(participants.data);
      setSessions(sections.data);
    }
    fetchData();
  }, [sectionId]);

  const sessionList = sessions.map((session) => (
    <SessionCard name={session.name} description={session.description} />
  ));

  const sessionInformation =
    sessions.length > 0 ? (
      <CardGrid size={5}>{sessionList}</CardGrid>
    ) : (
      <h1>No sessions yet. Stay tuned!</h1>
    );

  return (
    <div>
      <h1>Content:</h1>
      <p>New content is released every week!</p>

      {sessionInformation}
      <h1>Section Participants:</h1>
      <CardGrid>
        <SectionParticipants names={participantNames} />
      </CardGrid>
      <Button
        variant="contained"
        color="secondary"
        onClick={async () => {
          await CourseApi.post("/leaveSection", {
            userId: getUser(),
            sectionId,
          });
          props.onLeave();
        }}
      >
        Leave Section
      </Button>
    </div>
  );
}

function SectionParticipants(props) {
  const classes = cardStyle();
  return (
    <Card class={classes.root}>
      {props.names.map((name) => (
        <CardContent>
          <Typography variant="body2" color="textSecondary" component="p">
            {name}
          </Typography>
        </CardContent>
      ))}
    </Card>
  );
}

function SessionCard(props) {
  return (
    <Card>
      <CardHeader title={props.name} />
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
          {props.description}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default CourseView;
