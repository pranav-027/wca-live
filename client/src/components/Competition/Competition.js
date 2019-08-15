import React, { Fragment, useState } from 'react';
import { Switch, Route, Link, Redirect } from 'react-router-dom';
import gql from 'graphql-tag';
import AppBar from '@material-ui/core/AppBar';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Hidden from '@material-ui/core/Hidden';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';

import CustomQuery from '../CustomQuery/CustomQuery';
import EventList from '../EventList/EventList';
import Round from '../Round/Round';
import Competitors from '../Competitors/Competitors';
import Competitor from '../Competitor/Competitor';

const COMPETITION_QUERY = gql`
  query Competition($id: ID!) {
    competition(id: $id) {
      id
      name
      events {
        id
        name
        rounds {
          id
          name
          open
        }
      }
    }
    me {
      id
      manageableCompetitions {
        id
      }
    }
  }
`;

const drawerWidth = 250;

const useStyles = makeStyles(theme => ({
  appBar: {
    color: theme.palette.type === 'dark' ? '#fff' : null,
    backgroundColor: theme.palette.type === 'dark' ? grey['900'] : null,
  },
  appBarShift: {
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  drawer: {
    [theme.breakpoints.up('md')]: {
      width: drawerWidth,
    },
  },
  content: {
    overflowY: 'auto',
    padding: theme.spacing(2, 1),
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(3),
    },
  },
  contentShift: {
    [theme.breakpoints.up('md')]: {
      marginLeft: drawerWidth,
    },
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  title: {
    flexGrow: 1,
  },
  titleLink: {
    color: 'inherit',
    textDecoration: 'none',
  },
}));

const Competition = ({ match, location }) => {
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <CustomQuery query={COMPETITION_QUERY} variables={{ id: match.params.id }}>
      {({ data }) => {
        const { competition, me } = data;
        const manageableByCurrentUser =
          me &&
          me.manageableCompetitions.some(({ id }) => id === competition.id);

        const drawerContent = (
          <Fragment>
            <div className={classes.toolbar}>
              <IconButton component={Link} to="/">
                <Icon>home</Icon>
              </IconButton>
              <IconButton
                component={Link}
                to={`/competitions/${competition.id}/competitors`}
              >
                <Icon>people</Icon>
              </IconButton>
            </div>
            <Divider />
            <EventList
              events={competition.events}
              competitionId={competition.id}
            />
          </Fragment>
        );

        /* See: https://material-ui.com/components/drawers/#swipeable-temporary-drawer */
        const iOS =
          process.browser && /iPad|iPhone|iPod/.test(navigator.userAgent);

        return (
          <Fragment>
            <AppBar
              position="static"
              className={classes.appBar + ' ' + classes.appBarShift}
            >
              <Toolbar>
                <IconButton
                  color="inherit"
                  className={classes.menuButton}
                  onClick={() => setMobileOpen(true)}
                >
                  <Icon>menu</Icon>
                </IconButton>
                <Typography
                  variant="h6"
                  color="inherit"
                  className={classes.title}
                  noWrap={true}
                >
                  <Link
                    to={`/competitions/${competition.id}`}
                    className={classes.titleLink}
                  >
                    {competition.name}
                  </Link>
                </Typography>
                <div style={{ flexGrow: 1 }} />
                {manageableByCurrentUser && (
                  <IconButton
                    color="inherit"
                    component={Link}
                    to={`/admin${location.pathname}`}
                  >
                    <Icon>lock</Icon>
                  </IconButton>
                )}
              </Toolbar>
            </AppBar>
            <Hidden mdUp>
              <SwipeableDrawer
                open={mobileOpen}
                onOpen={() => setMobileOpen(true)}
                onClose={() => setMobileOpen(false)}
                onClick={() => setMobileOpen(false)}
                classes={{ paper: classes.drawer }}
                disableBackdropTransition={!iOS}
                disableDiscovery={iOS}
              >
                {drawerContent}
              </SwipeableDrawer>
            </Hidden>
            <Hidden smDown>
              <Drawer variant="permanent" classes={{ paper: classes.drawer }}>
                {drawerContent}
              </Drawer>
            </Hidden>
            <div className={classes.content + ' ' + classes.appBarShift}>
              <Switch>
                <Route
                  exact
                  path="/competitions/:competitionId/rounds/:roundId"
                  component={Round}
                />
                <Route
                  exact
                  path="/competitions/:competitionId/competitors"
                  component={Competitors}
                />
                <Route
                  exact
                  path="/competitions/:competitionId/competitors/:competitorId"
                  component={Competitor}
                />
                <Redirect to={`/competitions/${competition.id}`} />
              </Switch>
            </div>
          </Fragment>
        );
      }}
    </CustomQuery>
  );
};

export default Competition;
