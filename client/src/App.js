import logo from './logo.svg';
import './App.css';

import CssBaseline from '@material-ui/core/CssBaseline';
import DraftEditor from "./DraftEditor";
import { Typography, Button, ButtonGroup, Container, Paper, Box, Avatar, Grid } from "@material-ui/core";
import Content from "./Content";


import DetectableOverflow from 'react-detectable-overflow';
import { useEffect, useState } from 'react';


function App() {


  
  return (

    <>
      <CssBaseline />
    

      <Grid container
        direction="row"
        justifyContent="space-around"
        alignItems="flex-start"
        spacing={0}
      >
        <Grid item xs={12} sm={12} md={10} lg={6} xl={6} >

          <DraftEditor />
        </Grid>

      </Grid>

      {/* <div style={{ margin: "0px" }} /> */}



      <Content />


      <div style={{ margin: 100 }} />

    </>
  );
}

export default App;
