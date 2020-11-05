import React from "react";
import Grid from "@material-ui/core/Grid";

// Component that renders material-ui cards in a nice grid
function CardGrid({ children, size }) {
  return (
    <div style={{ padding: 20 }}>
      <Grid
        container
        spacing={10}
        direction="column"
        alignItems="center"
        justify="center"
      >
        {React.Children.map(children, (child) => {
          return (
            <Grid item xs={size}>
              <child.type {...child.props} />
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
}

export default CardGrid;
