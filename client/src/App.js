





import logo from './logo.svg';
import './App.css';

import CssBaseline from '@material-ui/core/CssBaseline';
import DraftEditor from "./DraftEditor";
import { Typography, Button, ButtonGroup, Container, Paper, Box, Avatar, Grid } from "@material-ui/core";
import Content from "./Content";

import url, { axios } from "./config";
import DetectableOverflow from 'react-detectable-overflow';
import { useEffect, useState, useContext, useRef } from 'react';


import { Context } from "./ContextProvider"

import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2, } from 'react-html-parser';



//import multiavatar from '@multiavatar/multiavatar'
//import yellow from '@material-ui/core/colors/yellow';


function App() {



  //return  <div dangerouslySetInnerHTML={{__html: svgCode}} />

  //eturn ReactHtmlParser(svgCode)
  // return (

  //   <img src={`http://localhost/aaa.svg`} />

  // )

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





      <Content />



    </>
  );
}

export default App;

