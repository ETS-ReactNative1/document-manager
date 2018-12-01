import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Field, reduxForm } from 'redux-form';

// Material-UI component imports
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

import styles from '../../infrastructure/styles';
import TextField from '../../ui/TextField';
import validate from '../../infrastructure/Validate';

const SignUpForm = ({
  classes,
  handleSubmit,
  isPasswordVisible,
  showPasssword,
  submitting
}) => (
  <Fragment>
    <Grid
      container
      spacing={24}
      direction="column"
      alignContent="center"
      alignItems="center"
      className={classes.grid}
    >
      <Card className={classes.card}>
        <CardContent>
          <Typography variant="h2" component="h2">
            Sign up
          </Typography>
          <form
            className={classes.root}
            onSubmit={handleSubmit}
          >
            <FormControl fullWidth className={classes.formControl}>
              <InputLabel htmlFor="email">Email</InputLabel>
              <Field name="email" component={TextField} type="email" label="Email" />
            </FormControl>
            <FormControl fullWidth className={classes.formControl}>
              <InputLabel htmlFor="username">Username</InputLabel>
              <Field name="username" component={TextField} type="text" label="Username" />
            </FormControl>
            <FormControl fullWidth className={classes.formControl}>
              <InputLabel htmlFor="firstname">Firstname</InputLabel>
              <Field name="firstname" component={TextField} type="text" label="Firstname" />
            </FormControl>
            <FormControl fullWidth className={classes.formControl}>
              <InputLabel htmlFor="lastname">Lastname</InputLabel>
              <Field name="lastname" component={TextField} type="text" label="Lastname" />
            </FormControl>
            <FormControl fullWidth className={classes.formControl}>
              <InputLabel htmlFor="password">Password</InputLabel>
              <Field
                name="password"
                component={TextField}
                type={isPasswordVisible ? 'text' : 'password'}
                label="Password"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={showPasssword}
                      onMouseDown={(event) => { event.preventDefault(); }}
                    >
                      {isPasswordVisible ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                } />
            </FormControl>
            <FormControl fullWidth className={classes.formControl}>
              <InputLabel htmlFor="confirmPassword">Confirm Password</InputLabel>
              <Field name="confirmPassword" component={TextField} type="password" label="ConfirmPassword" />
            </FormControl>
            <FormControl>
              <Button
                variant="contained"
                color="primary"
                className={classes.button}
                type="submit"
                disabled={submitting}
              >
                Sign Up
              </Button>
            </FormControl>
          </form>
        </CardContent>
      </Card>
    </Grid>
  </Fragment>
);

SignUpForm.propTypes = {
  classes: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  isPasswordVisible: PropTypes.bool.isRequired,
  showPasssword: PropTypes.func.isRequired,
  submitting: PropTypes.bool
};

export default reduxForm({ form: 'signup', validate })(withStyles(styles)(SignUpForm));