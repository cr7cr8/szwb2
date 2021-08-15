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
  BrowserTypes,
  deviceDetect
} from "react-device-detect";

//import axios from 'axios';
import url, { axios } from './config';
import jwtDecode from 'jwt-decode';

import yellow from '@material-ui/core/colors/yellow';
import { PhoneMissed } from '@material-ui/icons';





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



  const [token, setToken] = useState(
    localStorage.getItem("token")
      ? jwtDecode(localStorage.getItem("token"))
      : { userName: "__temp__" }
  );


  const [editorContent, setEditorContent] = useState(
    EditorState.createWithContent(ContentState.createFromText(''))
  );

  const [isLight, setIsLight] = useState(true)
  const [picArr, setPicArr] = useState([])

  const [postArr, setPostArr] = useState([])
  const [postPicArr, setPostPicArr] = useState([])

  //const postCount = useRef(0)


  const changeOwnerName = function (newName) {

    return axios.post(`${url}/article/changeownername`, { newName }).then(response => {

      if (!response.data) {
        return response.data
      }
      else {
        localStorage.setItem("token", response.headers["x-auth-token"])
        setToken(jwtDecode(response.headers["x-auth-token"]));
        return token
      }






    })

  }

  const getSinglePost = function () {
    const postingTime = Math.min(...postArr.map(item => item.postingTime), Date.now())
    console.log(...postArr.map(item => item.postingTime))



    return axios.get(`${url}/article/singlepost2/${postingTime}`).then(response => {

      //  console.log(response.data)
      if (response.data.length === 0) {




        return Promise.resolve(response.data)
      }


      // alert(JSON.stringify(Object.keys(response.data[0])))

      setPostArr(pre => { return [...pre, ...response.data.map(item => item),] })
      setPostPicArr(pre => [...pre, ""])

      return response.data
    })


  }




  const deleteSinglePost = useCallback(function (postID) {
    return axios.get(`${url}/article/deletesinglepost/${postID}`).then(response => {
      const postIndex = postArr.findIndex(item => { return item.postID === postID })

      setPostArr(pre => { return pre.filter(item => item.postID !== postID) })
      setPostPicArr(pre => {
        return pre.filter((item, index) => { return index !== postIndex })

      })

      return response.data
    })


  })



  const sizeArr = ["1.5rem", "1.5rem", "1.5rem", "1.5rem", "1.5rem"]
  const iconSizeArr = ["2rem", "2rem", "2rem", "2rem", "2rem"]
  //const iconSizeArr = ["1.5rem", "1.5rem", "1.5rem", "1.5rem", "1.5rem"]

  useEffect(function () {


    if (token.userName === "__temp__") {


      axios.post(`${url}/user/register`, token).then(response => {
        localStorage.setItem("token", response.headers["x-auth-token"])
        setToken(jwtDecode(response.headers["x-auth-token"]));
      })


    }
  }, [])



  const theme = useMemo(function () {

    let muiTheme = createTheme({

      backgourndImageArr: [


        { backgroundImage: `url(${url}/picture/downloadbackpicture/60b7028076fa440017fb5779)`, color: "darkgray" },
        { backgroundImage: `url(${url}/picture/downloadbackpicture/60b6f77fae1acf0017a96c4b)`, color: "orange" },
        { backgroundImage: `url(${url}/picture/downloadbackpicture/60b701a9dc07780017dcfd38)`, color: "white" },
        { backgroundImage: "url(https://picsum.photos/1024/576)", color: "white" },
        { backgroundImage: "url(https://picsum.photos/512/288)", color: "white" },
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
        //     MuiInputLabel: {
        //       root: {
        //         fontSize: "3rem",

        //       },
        //       animated: {
        //         fontSize: "3rem",
        //       },
        //       shrink:{
        //         transform: "translate(0, 1.5px) scale(0.5)"
        // //        fontSize:"3rem",
        //       },
        //     },

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

            borderRadius: 0,
            backgroundColor: "transparent",
            "& .MuiChip-avatar": {
              color: "#616161",
              marginLeft: "5px",
              marginRight: "-6px",
              objectFit: "cover",
              textAlign: "center",

              ...breakpointsAttribute(["width", ...sizeArr], ["height", ...sizeArr])
            },
            //  backgroundColor:"transparent",




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
      token, setToken,
      isLight, setIsLight, theme, breakpointsAttribute, editorContent,
      setEditorContent, lgSizeObj, smSizeObj, deviceSize,
      picArr, setPicArr,
      postArr, setPostArr,
      postPicArr, setPostPicArr,
      getSinglePost, deleteSinglePost,
      changeOwnerName,

      // backImageArr, setBackImageArr,
      // backImageIndex, setBackImageIndex,

    }}>
      <ThemeProvider theme={theme}>
        {props.children}
      </ThemeProvider>
    </Context.Provider>
  )


}