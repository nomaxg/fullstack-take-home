import { makeStyles } from "@material-ui/core/styles";

export const cardStyle = makeStyles((theme) => ({
  root: {
    maxWidth: 500,
    minWidth: 250,
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  media: {
    height: 0,
    paddingTop: "56.25%", // 16:9
  },
}));
