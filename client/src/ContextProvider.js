import React, { createContext, useEffect, useState, useReducer, useRef, useMemo, useCallback, useLayoutEffect } from 'react';

import { createTheme, ThemeProvider, responsiveFontSizes, } from "@material-ui/core";
import useMediaQuery from '@material-ui/core/useMediaQuery';
import primaryColor from '@material-ui/core/colors/indigo';

import { EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, AtomicBlockUtils } from 'draft-js';


import { makeStyles, styled, useTheme, } from '@material-ui/core/styles';
import createBreakpoints from '@material-ui/core/styles/createBreakpoints';
import {
  isMobile,
  isFirefox,
  isChrome,
  browserName,
  engineName,
} from "react-device-detect";

import axios from 'axios';
import url from './config';

import yellow from '@material-ui/core/colors/yellow';
export const Context = createContext();
const breakpoints = createBreakpoints({})

function breakpointsAttribute(...args) {

  let xs = {}
  let sm = {}
  let md = {}
  let lg = {}
  let xl = {}

  args.forEach(item => {
    xs = { ...xs, [item[0]]: item[1] }
    sm = { ...sm, [item[0]]: item[2] || item[1] }
    md = { ...md, [item[0]]: item[3] || item[2] || item[1] }
    lg = { ...lg, [item[0]]: item[4] || item[3] || item[2] || item[1] }
    xl = { ...xl, [item[0]]: item[5] || item[4] || item[3] || item[2] || item[1] }
  })


  return {
    [breakpoints.only('xs')]: { ...xs },
    [breakpoints.only('sm')]: { ...sm },
    [breakpoints.only('md')]: { ...md },
    [breakpoints.only('lg')]: { ...lg },
    [breakpoints.only('xl')]: { ...xl },
  }
}



export default function ContextProvider(props) {


  const [editorContent, setEditorContent] = useState(
    EditorState.createWithContent(ContentState.createFromText(''))
  );

  const [isLight, setIsLight] = useState(true)
  const [picArr, setPicArr] = useState([])

  const [postArr, setPostArr] = useState([])
  const [postPicArr, setPostPicArr] = useState([])

  const postCount = useRef(0)


  const getSinglePost = useCallback(function (num) {

    if (num < postCount.current || num===0){
      axios.get(`${url}/article/singlepost/${num}`).then(response => {

      //  console.log(response.data)

        setPostArr(pre => { return [...pre, ...response.data.map(item => item.content),] })
        setPostPicArr(pre => [...pre, ""])
      })
    }
  })

  // const [backImageArr, setBackImageArr] = useState(
  //   [
  //     "url(https://mernchen.herokuapp.com/api/picture/download/60b7028076fa440017fb5779)",
  //     "url(https://mernchen.herokuapp.com/api/picture/download/60b6f77fae1acf0017a96c4b)",
  //     "url(https://mernchen.herokuapp.com/api/picture/download/60b701a9dc07780017dcfd38)",
  //   ])

  // const [backImageIndex, setBackImageIndex] = useState(0)


  const sizeArr = ["1.5rem", "1.5rem", "1.5rem", "1.5rem", "1.5rem"]
  const iconSizeArr = ["2rem", "2rem", "2rem", "2rem", "2rem"]
  //const iconSizeArr = ["1.5rem", "1.5rem", "1.5rem", "1.5rem", "1.5rem"]

  useEffect(function () {
    axios.get(`${url}/article/count`).then(response => {
      postCount.current = response.data
    })
    //   axios.get(`${url}/article/singlepost/0`).then(response => {

    //     console.log(response.data)

    //     setPostArr(response.data.map(item => item.content))
    //     setPostPicArr(new Array(response.data.length))
    //   })
    //   //picture/downloadpicture/905137_Capture-_887.PNG

    //   // axios.get(`${url}/picture/downloadpicture`).then(response => {

    //   //   console.log(response.data)
    //   //   setPostArr(response.data.map(item => item.content))
    //   // })

  }, [])



  const theme = useMemo(function () {

    let muiTheme = createTheme({

      backgourndImageArr: [
        // { backgroundImage: "url(https://picsum.photos/800/450)",color:"orange"},
        // { backgroundImage: "url(https://picsum.photos/960/540)",color:"red"},
        // { backgroundImage: "url(https://picsum.photos/880/490)",color:"yellow"},
        // { backgroundImage: "url(https://picsum.photos/1024/576)",color:"pink"},

        // { backgroundImage: "url(https://cors-anywhere.herokuapp.com/https://photo.weibo.com/7354287965/wbphotos/large/mid/4643997090057849/pid/0081HQfPly1gr50t2i2uaj31040kc0up)"}

        //"url(https://picsum.photos/800/450)"

        { backgroundImage: "url(https://mernchen.herokuapp.com/api/picture/download/60b7028076fa440017fb5779)", color: "darkgray" },
        { backgroundImage: "url(https://mernchen.herokuapp.com/api/picture/download/60b6f77fae1acf0017a96c4b)", color: "orange" },
        { backgroundImage: "url(https://mernchen.herokuapp.com/api/picture/download/60b701a9dc07780017dcfd38)", color: "white" },
        { backgroundImage: "url(https://picsum.photos/1024/576)", color: "white" },
      ],
      palette: {
        primary: primaryColor,
        type: isLight ? 'light' : "dark",
        // mentionBackColor: isLight ? "#b7e1fc" : muiTheme.palette.primary.light,
      },
      typography: {
        fontSize: 14,
        button: { textTransform: 'none' },
        body2: breakpointsAttribute(["fontSize", ...sizeArr])
      },

      overrides: {

        MuiAvatar: {
          root: {
            ...breakpointsAttribute(["width", ...iconSizeArr], ["height", ...iconSizeArr]),
          }
        },

        MuiSvgIcon: {
          root: {
            ...breakpointsAttribute(["fontSize", ...iconSizeArr]),
          }
        },
        MuiChip: {
          root: {
            "& .MuiChip-avatar": {
              color: "#616161",
              marginLeft: "5px",
              marginRight: "-6px",
              objectFit: "cover",
              textAlign: "center",

              ...breakpointsAttribute(["width", ...sizeArr], ["height", ...sizeArr])
            },
          },
          label: {
            "& > .MuiTypography-root.MuiTypography-body2": {
              ...breakpointsAttribute(["fontSize", "1.2rem", "1.2rem"]),
            }
          }
        },
      },
    })
    muiTheme.palette.mentionBackColor = isLight ? "#b7e1fc" : muiTheme.palette.primary.light;
    return muiTheme
  }, [isLight])


  const xs = useMediaQuery(theme.breakpoints.only('xs'));
  const sm = useMediaQuery(theme.breakpoints.only('sm'));
  const md = useMediaQuery(theme.breakpoints.only('md'));
  const lg = useMediaQuery(theme.breakpoints.only('lg'));
  const xl = useMediaQuery(theme.breakpoints.only('xl'));

  const deviceSize = xs ? "xs" : sm ? "sm" : md ? "md" : lg ? "lg" : "xl"
  const lgSizeObj = { xs: "2.5rem", sm: "2.5rem", md: "2.5rem", lg: "2.5rem", xl: "2.5rem" }
  const smSizeObj = { xs: "1rem", sm: "1rem", md: "1rem", lg: "1rem", xl: "1rem" }

  //const [picArr, setPicArr] = useState([])


  // theme.typography.body2 = {
  //   ...breakpointsFontSize(["fontSize", "2.5rem", "1.5rem"])
  // };
  //theme = responsiveFontSizes(theme);

  // console.log(theme)


  return (
    <Context.Provider value={{
      isLight, setIsLight, theme, breakpointsAttribute, editorContent,
      setEditorContent, lgSizeObj, smSizeObj, deviceSize,
      picArr, setPicArr,
      postArr, setPostArr,
      postPicArr, setPostPicArr,
      getSinglePost,
      // backImageArr, setBackImageArr,
      // backImageIndex, setBackImageIndex,

    }}>
      <ThemeProvider theme={theme}>
        {props.children}
      </ThemeProvider>
    </Context.Provider>
  )


}