import { useState, useRef, useEffect, useContext, useCallback, createContext, useMemo } from 'react';
import { Context } from "./ContextProvider"


import { EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, AtomicBlockUtils } from 'draft-js';
import Editor from "draft-js-plugins-editor";
import Immutable from 'immutable';
import Masonry from 'react-masonry-css';
import { makeStyles, styled, useTheme } from '@material-ui/core/styles';

import { stateToHTML } from 'draft-js-export-html';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2, } from 'react-html-parser';


import DetectableOverflow from 'react-detectable-overflow';



import { Typography, Button, ButtonGroup, Container, Paper, Box, Avatar, Grid, Chip, Link } from "@material-ui/core";
import { Image, Brightness4, Brightness5, FormatBold, FormatItalic, FormatUnderlined, InsertEmoticon, NavigateBeforeSharp } from "@material-ui/icons";
import useMediaQuery from '@material-ui/core/useMediaQuery';

import { useStyles } from './DraftEditor';
import { useStyles as mentionStyles } from './MentionPlugin';

import url from './config';

import {
  isMobile,
  isFirefox,
  isChrome,
  browserName,
  engineName,
} from "react-device-detect";

import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css'; // This only needs to be imported once in your app

import LazyLoad from 'react-lazyload';
import { useInView } from 'react-intersection-observer';

export default function Content({ style }) {

  const { editorContent, setEditorContent, lgSizeObj, smSizeObj, deviceSize, picArr, setPicArr,
    postArr, setPostArr,
    postPicArr, setPostPicArr, } = useContext(Context);

  const theme = useTheme()
  const { editorPaperCss, className1, unstyledBlockCss, imageBlockCss, centerBlockCss, rightBlockCss, } = useStyles({})
  const { mentionHeadRoot, mentionBodyRoot, mentionBodyRoot2, mentionHeadAvatar, mentionHeadLabel, mentionHeadLabel2, mentionBodyLabel, } = mentionStyles();


  function toHtml(preHtml, imgArr, inView) {
    //  alert("bbbb")
    const html = ReactHtmlParser(preHtml, {



      transform: function transformFn(node, index) {



        if (node.name === "imgtag") {
          return (inView && <ImgTag key={index} picArr={imgArr} picName={node.attribs.id} />)
        }
        if (node.name === "emoji") {

          //   console.log(node.attribs.symbol, node.attribs.imgurl)
          return (
            <Typography variant="body2"
              key={index}
              style={{
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center center",
                backgroundSize: "contain",
                display: "inline-block",
                textAlign: "right",
                color: "rgba(0,0,0,0)",
                backgroundImage: node.attribs.imgurl,
                transform: isMobile ? "scale(1.2)" : "scale(1.2)",
                marginLeft: theme.typography.fontSize * 0.12,
                marginRight: theme.typography.fontSize * 0.12,
              }}
            >{node.attribs.symbol}</Typography>
          )
        }
        if (node.name === "longmentionoff_head") {
          return (<span key={index}></span>)
        }
        if (node.name === "longmentionoff_body") {

          const arr = [];
          node.children.forEach(element => {
            arr.push(convertNodeToElement(element))
          })
          return (
            <Chip classes={{ root: mentionBodyRoot2, label: mentionBodyLabel }}
              key={index}
              avatar={< Avatar alt={null} src={node.attribs.imgurl.replace("url(", "").replace(")", "")}   //src={friendObj[person]}
              />}
              label={
                <Typography variant="body2">
                  {arr.map((element, index) => {
                    return <span key={index}>{element}</span>
                  })}
                </Typography>
              }
            // label={< Typography variant="body2" >{node.attribs.person}</Typography >}
            />
          )
        }
        if (Object.keys(node.attribs || {}).includes("colorblock")) {

          const arr = [];
          const arr2 = [];
          const backimage = node.attribs.backimage
          const textcolor = node.attribs.textcolor
          node.children.forEach(item => {

            arr.push(item.type === "tag" ? item : item.data)
            arr2.push(convertNodeToElement(item))
          })
          return (
            <BackColorTag arr={arr} transformFn={transformFn} index={index} arr2={arr2} backimage={backimage} textcolor={textcolor} inView={inView} key={Math.random()} />
          )
        }
        if (node.name === "linkoff") {

          const arr = [];
          node.children.forEach(element => {
            arr.push(convertNodeToElement(element))
          })
          return <span key={index}><LinkTag toHtml={toHtml} node={node} imgArr={imgArr} index={index} /></span>
        }

      },
    })

    return html
  }

  const breakpointColumnsObj = {
    [theme.breakpoints.values.xs]: 1,
    [theme.breakpoints.values.sm]: 1,
    [theme.breakpoints.values.md]: 2,
    [theme.breakpoints.values.lg]: 3,
    [theme.breakpoints.values.xl]: 4,
  };




  return (
    <>

      <Container disableGutters={false}   >

        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >

          {postArr.map(function (item, index) {





            return (
              // <LazyLoad offset={0}>

              // <Paper classes={{ root: editorPaperCss }} elevation={3}
              //   style={{ overflow: "hidden", padding: "0px", whiteSpace: "normal" }} key={index}>


              //   {toHtml(postArr[index], postPicArr[index])}



              // </Paper>
              // </LazyLoad>

              <PaperContent postArr={postArr} postPicArr={postPicArr} index={index} editorPaperCss={editorPaperCss} toHtml={toHtml} />
            )

          })}


        </Masonry>
      </Container>
    </>
  )

}

function PaperContent({ postArr, postPicArr, index, editorPaperCss, toHtml }) {

  const { ref, inView, entry } = useInView({
    /* Optional options */
    threshold: 0,
    triggerOnce: true,
    initialInView: false,
  });


  return (
    <Paper classes={{ root: editorPaperCss }} elevation={3} ref={ref}
      style={{ overflow: "hidden", padding: "0px", whiteSpace: "normal" }} key={index}>

      {/* {`${inView}`} */}
      {toHtml(postArr[index], postPicArr[index], inView)}



    </Paper>

  )
}



function ImgTag({ picArr, picName, ...props }) {

  //  const { editorContent, setEditorContent, lgSizeObj, smSizeObj, deviceSize, picArr, setPicArr } = useContext(Context1);
  const theme = useTheme()
  const picNum = picName === "local" ? picArr.length : Number(picName.split("_")[1])
  const imgArr = picArr



  const [photoIndex, setPhotoIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  if (picNum === 1) {

    const images = picName === "local"
      ? [imgArr[0].localUrl]
      : [`${url}/picture/downloadpicture/${picName}_0`]


    return (



      <div style={{

        position: "relative",
        width: "100%",
        height: 0,
        paddingBottom: "56.25%",

        backgroundRepeat: "no-repeat",
        backgroundPositionX: "center",
        backgroundPositionY: "center",
        backgroundSize: "cover",
        backgroundImage: picName === "local" ? "url(" + imgArr[0].localUrl + ")" : `url(${url}/picture/downloadpicture/${picName}_0)`,

        backgroundColor: theme.palette.divider,   //"skyblue",
        overflow: "hidden",

      }} onClick={function () {

        setIsOpen(true)


      }} >
        {isOpen && <Lightbox
          mainSrc={images[photoIndex]}
          nextSrc={images[(photoIndex + 1) % images.length]}
          prevSrc={images[(photoIndex + images.length - 1) % images.length]}
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() =>
            setPhotoIndex(
              pre => (pre + images.length - 1) % images.length,
            )
          }
          onMoveNextRequest={() =>
            setPhotoIndex(
              pre => (pre + images.length + 1) % images.length,
            )
          }
        />}
      </div>



    )
  }
  else if (picNum === 2) {

    const images = picName === "local"
      ? [imgArr[0].localUrl, imgArr[1].localUrl]
      : [`${url}/picture/downloadpicture/${picName}_0`, `${url}/picture/downloadpicture/${picName}_1`]


    return (



      <div style={{
        position: "relative",
        width: "100%",
        height: 0,
        paddingBottom: "56.25%",
        backgroundPositionX: "center",
        backgroundPositionY: "center",
        backgroundColor: theme.palette.divider,   //"skyblue",
        overflow: "hidden",
        //    padding:0,

      }}>


        <div style={{
          position: "absolute",
          width: "50%",
          height: "100%",
          //  paddingBottom: "25%",//  "112.5%", 
          backgroundColor: "pink",
          left: "0%",
          top: "0%",
          backgroundRepeat: "no-repeat",
          overflow: "hidden",
          backgroundPositionX: "center",
          backgroundPositionY: "center",
          backgroundSize: "cover",
          //  backgroundImage: "url(" + imgArr[0].localUrl + ")",
          backgroundImage: picName === "local" ? "url(" + imgArr[0].localUrl + ")" : `url(${url}/picture/downloadpicture/${picName}_0)`,
          transform: "translateX(-1px) translateY(0px)",
          backgroundColor: "wheat",
        }}
          onClick={function () {
            setPhotoIndex(0)
            setIsOpen(true)
            //    setPicArr(pre => [pre[1]])
          }}

        />
        <div style={{
          position: "absolute",
          width: "50%",
          height: "100%",
          //  paddingBottom: "25%",//  "112.5%", 
          backgroundColor: "wheat",
          left: "50%",
          top: "0%",
          backgroundRepeat: "no-repeat",
          overflow: "hidden",
          backgroundPositionX: "center",
          backgroundPositionY: "center",
          backgroundSize: "cover",
          // backgroundImage: "url(" + imgArr[1].localUrl + ")",
          backgroundImage: picName === "local" ? "url(" + imgArr[1].localUrl + ")" : `url(${url}/picture/downloadpicture/${picName}_1)`,

          transform: "translateX(1px) translateY(0px)",
          backgroundColor: "wheat",
        }}
          onClick={function () {
            //    setPicArr(pre => [pre[0]])
            setPhotoIndex(1)
            setIsOpen(true)
          }}
        />


        {isOpen && <Lightbox
          mainSrc={images[photoIndex]}
          nextSrc={images[(photoIndex + 1) % images.length]}
          prevSrc={images[(photoIndex + images.length - 1) % images.length]}
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() =>
            setPhotoIndex(
              pre => (pre + images.length - 1) % images.length,
            )
          }
          onMoveNextRequest={() =>
            setPhotoIndex(
              pre => (pre + images.length + 1) % images.length,
            )
          }
        />}


      </div>

    )
  }
  else if (picNum === 3) {

    const images = picName === "local"
      ? [imgArr[0].localUrl, imgArr[1].localUrl, imgArr[2].localUrl]
      : [`${url}/picture/downloadpicture/${picName}_0`, `${url}/picture/downloadpicture/${picName}_1`, `${url}/picture/downloadpicture/${picName}_2`]

    return (



      <div style={{
        position: "relative",
        width: "100%",
        height: 0,
        paddingBottom: "56.25%",
        backgroundPositionX: "center",
        backgroundPositionY: "center",
        backgroundColor: theme.palette.divider,   //"skyblue",
        overflow: "hidden",
        //    padding:0,
      }}>


        <div style={{
          position: "absolute",
          width: "50%",
          height: "100%",
          //  paddingBottom: "25%",//  "112.5%", 
          backgroundColor: "pink",
          left: "0%",
          top: "0%",
          backgroundRepeat: "no-repeat",
          overflow: "hidden",
          backgroundPositionX: "center",
          backgroundPositionY: "center",
          backgroundSize: "cover",
          //  backgroundImage: "url(" + imgArr[0].localUrl + ")",
          backgroundImage: picName === "local" ? "url(" + imgArr[0].localUrl + ")" : `url(${url}/picture/downloadpicture/${picName}_0)`,

          transform: "translateX(-1px) translateY(0px)",
          backgroundColor: "wheat",
        }}
          onClick={function () {
            //    setPicArr(pre => [pre[1], pre[2]])
            setPhotoIndex(0)
            setIsOpen(true)
          }}

        />
        <div style={{
          position: "absolute",
          width: "50%",
          height: "50%",
          backgroundColor: "wheat",
          left: "50%",
          top: "0%",
          backgroundRepeat: "no-repeat",
          overflow: "hidden",
          backgroundPositionX: "center",
          backgroundPositionY: "center",
          backgroundSize: "cover",
          // backgroundImage: "url(" + imgArr[1].localUrl + ")",
          backgroundImage: picName === "local" ? "url(" + imgArr[1].localUrl + ")" : `url(${url}/picture/downloadpicture/${picName}_1)`,
          transform: "translateX(1px) translateY(-1px)",


        }} onClick={
          function () {
            //   setPicArr(pre => [pre[0], pre[2]])
            setPhotoIndex(1)
            setIsOpen(true)
          }} />

        <div style={{
          position: "absolute",
          width: "50%",
          height: "50%",
          backgroundColor: "wheat",
          left: "50%",
          top: "50%",
          backgroundRepeat: "no-repeat",
          overflow: "hidden",
          backgroundPositionX: "center",
          backgroundPositionY: "center",
          backgroundSize: "cover",
          //   backgroundImage: "url(" + imgArr[2].localUrl + ")",
          backgroundImage: picName === "local" ? "url(" + imgArr[2].localUrl + ")" : `url(${url}/picture/downloadpicture/${picName}_2)`,
          transform: "translateX(1px) translateY(1px)",

        }} onClick={
          function () {
            //   setPicArr(pre => [pre[0], pre[1]])
            setPhotoIndex(2)
            setIsOpen(true)
          }} />

        {isOpen && <Lightbox
          mainSrc={images[photoIndex]}
          nextSrc={images[(photoIndex + 1) % images.length]}
          prevSrc={images[(photoIndex + images.length - 1) % images.length]}
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() =>
            setPhotoIndex(
              pre => (pre + images.length - 1) % images.length,
            )
          }
          onMoveNextRequest={() =>
            setPhotoIndex(
              pre => (pre + images.length + 1) % images.length,
            )
          }
        />}


      </div>



    )
  }

  else {


    const images = picName === "local"
      ? [imgArr[0].localUrl, imgArr[1].localUrl, imgArr[2].localUrl, imgArr[3].localUrl]
      : [`${url}/picture/downloadpicture/${picName}_0`, `${url}/picture/downloadpicture/${picName}_1`, `${url}/picture/downloadpicture/${picName}_2`, `${url}/picture/downloadpicture/${picName}_3`]


    return (


      <div style={{
        position: "relative",
        width: "100%",
        height: 0,
        paddingBottom: "56.25%",
        backgroundPositionX: "center",
        backgroundPositionY: "center",
        backgroundColor: theme.palette.divider,   //"skyblue",
        overflow: "hidden",
        //   padding:0,
      }}>


        <div style={{
          position: "absolute",
          width: "50%",
          height: "50%",
          backgroundColor: "wheat",
          top: "0%",
          left: "0%",
          backgroundRepeat: "no-repeat",
          overflow: "hidden",
          backgroundPositionX: "center",
          backgroundPositionY: "center",
          backgroundSize: "cover",
          // backgroundImage: "url(" + imgArr[0].localUrl + ")",
          backgroundImage: picName === "local" ? "url(" + imgArr[0].localUrl + ")" : `url(${url}/picture/downloadpicture/${picName}_0)`,

          transform: "translateX(-1px) translateY(-1px)",

        }} onClick={function () {
          //  setPicArr(pre => [pre[1], pre[2], pre[3]])
          setPhotoIndex(0)
          setIsOpen(true)
        }} />

        <div style={{
          position: "absolute",
          width: "50%",
          height: "50%",
          backgroundColor: "wheat",
          top: "0%",
          left: "50%",
          backgroundRepeat: "no-repeat",
          overflow: "hidden",
          backgroundPositionX: "center",
          backgroundPositionY: "center",
          backgroundSize: "cover",
          //   backgroundImage: "url(" + imgArr[1].localUrl + ")",
          backgroundImage: picName === "local" ? "url(" + imgArr[1].localUrl + ")" : `url(${url}/picture/downloadpicture/${picName}_1)`,
          transform: "translateX(1px) translateY(-1px)",

        }} onClick={function () {
          //   setPicArr(pre => [pre[0], pre[2], pre[3]])
          setPhotoIndex(1)
          setIsOpen(true)
        }} />

        <div style={{
          position: "absolute",
          width: "50%",
          height: "50%",
          backgroundColor: "wheat",
          top: "50%",
          left: "0%",
          backgroundRepeat: "no-repeat",
          overflow: "hidden",
          backgroundPositionX: "center",
          backgroundPositionY: "center",
          backgroundSize: "cover",
          //    backgroundImage: "url(" + imgArr[2].localUrl + ")",
          backgroundImage: picName === "local" ? "url(" + imgArr[2].localUrl + ")" : `url(${url}/picture/downloadpicture/${picName}_2)`,
          transform: "translateX(-1px) translateY(1px)",
        }}
          onClick={
            function () {
              //      setPicArr(pre => [pre[0], pre[1], pre[3]])
              setPhotoIndex(2)
              setIsOpen(true)
            }}
        />

        <div style={{
          position: "absolute",
          width: "50%",
          height: "50%",
          backgroundColor: "wheat",
          top: "50%",
          left: "50%",
          backgroundRepeat: "no-repeat",
          overflow: "hidden",
          backgroundPositionX: "center",
          backgroundPositionY: "center",
          backgroundSize: "cover",
          //   backgroundImage: "url(" + imgArr[3].localUrl + ")",
          backgroundImage: picName === "local" ? "url(" + imgArr[3].localUrl + ")" : `url(${url}/picture/downloadpicture/${picName}_3)`,
          transform: "translateX(1px) translateY(1px)",

        }} onClick={
          function () {
            //   setPicArr(pre => [pre[1], pre[2], pre[3]])
            setPhotoIndex(3)
            setIsOpen(true)
          }} />
        {isOpen && <Lightbox
          mainSrc={images[photoIndex]}
          nextSrc={images[(photoIndex + 1) % images.length]}
          prevSrc={images[(photoIndex + images.length - 1) % images.length]}
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() =>
            setPhotoIndex(
              pre => (pre + images.length - 1) % images.length,
            )
          }
          onMoveNextRequest={() =>
            setPhotoIndex(
              pre => (pre + images.length + 1) % images.length,
            )
          }
        />}

      </div>





    )



  }







}

function LinkTag({ toHtml, node, index, imgArr, ...props }) {

  const theme = useTheme()
  const host = node.attribs.linkhost;
  const address = node.attribs.linkaddress;



  const [content, setContent] = useState(host.substr(1))

  const arr = [];
  node.children.forEach((element, index) => {
    arr.push(convertNodeToElement(element))
  })

  return (
    <span
      target="_blank"
      //  key={index}
      style={{
        color: theme.palette.primary.main,
        cursor: "pointer"
      }}
      onClick={function (e) {
        e.stopPropagation()
        setContent(
          <Link href={address} target="_blank" rel="noopener">
            {arr.map((element, index) => {
              //    if (reactElementToJSXString(element) === "<br>") { return <></> }
              return element
            })}
          </Link>
        )

      }}
    >
      <span key={index}>{content}</span>
    </span>




  )
}

function BackColorTag({ backimage, textcolor, transformFn, node, index, arr, arr2, inView, ...props }) {

  const [isOverFlow, setIsOverFlow] = useState(false)
  //console.log(backImage)
  return (
    <DetectableOverflow

      onChange={function (overFlow) {
        setIsOverFlow(overFlow)
      }}

      key={index}
      style={{
        // backgroundImage: "url(https://mernchen.herokuapp.com/api/picture/download/60a204e70270cc001728285f)",
        // backgroundImage: "url(https://mernchen.herokuapp.com/api/picture/download/60a2062e95f2250017420aa4)",
        // backgroundImage: "url(https://mernchen.herokuapp.com/api/picture/download/60b701a9dc07780017dcfd38)",
        ...inView && { backgroundImage: backimage },
        color: textcolor,
        //  backgroundImage: "url(https://mernchen.herokuapp.com/api/picture/download/60b6f77fae1acf0017a96c4b)",


        //  backgroundImage: "url(https://picsum.photos/800/450)",
        backgroundSize: "cover",
        position: "relative",

        backgroundColor: "wheat",
        //  width: "100%",
        height: 0,

        paddingBottom: "56.25%",
        display: "flex",
        alignItems: isOverFlow ? "flex-start" : "center",
        justifyContent: "center",
        overflow: "auto",

      }}
    >

      <div style={{
        textAlign: "center",
        position: isOverFlow ? "block" : "absolute",
        ...!isOverFlow && { top: "50%" },
        ...!isOverFlow && { transform: "translateY(-50%)" },
        // color: "white",

        padding: "8px",
        whiteSpace: "pre-wrap"
      }}>

        {arr.map((item, index) => {

          if (item.name === "span") {
            item.children = item.children.filter(item => {
              return item.name !== "br"
            })
            return convertNodeToElement(item)
          }


          if (item.type !== "tag") { return <span key={index}>{item}</span> }
          else if (item.name === "span") {
            return arr2[index]
          }
          else {
            return <span key={index} >{transformFn(item, index)}</span>
          }


        })}

      </div>
    </DetectableOverflow>
  )


}