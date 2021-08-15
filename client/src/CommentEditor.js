import { useState, useRef, useEffect, useContext, useCallback, createContext, useMemo } from 'react';
import { Context } from "./ContextProvider"
import CssBaseline from '@material-ui/core/CssBaseline';

import { EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, AtomicBlockUtils } from 'draft-js';
import Editor from "draft-js-plugins-editor";
import Immutable from 'immutable';

import chainable from 'draft-js-plugins-chainable';

import { compareAsc, format, formatDistanceToNow, } from 'date-fns';
//import axios from 'axios';
import url, { axios } from './config';

import createImagePlugin from './ImagePlugin';
import createBoldPlugin from './BoldPlugin';
import createEmojiPlugin from './EmojiPlugin';
import createMentionPlugin from './MentionPlugin';
import createLinkPlugin from './LinkPlugin';
import createDeleteBlogPlugin from './DeleteBlogPlugin';
import createBackColorPlugin from './BackColorPlugin';

import { stateToHTML } from 'draft-js-export-html';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2, } from 'react-html-parser';
import { makeStyles, styled, useTheme } from '@material-ui/core/styles';

import { Typography, Button, ButtonGroup, Container, Paper, Box, Avatar, Grid, IconButton, Icon, Chip } from "@material-ui/core";
import { Image, Brightness4, Brightness5, FormatBold, FormatItalic, FormatUnderlined, InsertEmoticon, PaletteOutlined, Send } from "@material-ui/icons";
import useMediaQuery from '@material-ui/core/useMediaQuery';

import {
  isMobile,
  isFirefox,
  isChrome,
  browserName,
  engineName,
} from "react-device-detect";


//import yellow from '@material-ui/core/colors/yellow';



const { boldPlugin, BoldButton, ItalicButton, UnderlineButton, LargeButton, SmallButton, } = createBoldPlugin()
const { emojiPlugin, EmojiButton, EmojiPanel, EmojiIconButton } = createEmojiPlugin()
const { imagePlugin, ImageButton, TopImageButton, ImageBlog, hasImageBlock } = createImagePlugin()
const { mentionPlugin, MentionButton, MentionPanel, } = createMentionPlugin()
const { linkPlugin } = createLinkPlugin()
const { deleteBlogPlugin, DeleteBlogButton, AddTopLineButton, AddBottomLineButton, AlignCenterButton, AlignRightButton, } = createDeleteBlogPlugin()
const { backColorPlugin, AddBackColorButton, BackColorPanel } = createBackColorPlugin()




export const useStyles = makeStyles(theme => {

  // console.log(theme.backgourndImageArr)
  const obj = {}

  theme.backgourndImageArr.forEach((element, index) => {
    obj["css" + index] = element
  });


  console.log(obj)
  //const obj = { css1: { ...theme.backgourndImageArr[0] }, css2: { ...theme.backgourndImageArr[0] } }


  return {
    ...obj,
    labelShrinkCss: () => {
      return { transform: "translate(0, 1.5px) scale(0.5)" }
    },
    textFieldCss: () => {
      return { fontSize: "1.5rem" }
    },


    editorPaperCss: ({ isLight, breakpointsAttribute, isEditorFocusOn }) => {
      // console.log(isLight)
      return {
        // backgroundColor:"pink",
        borderWidth: "1px", borderStyle: "none",// borderRadius: "25px",
        borderColor: isEditorFocusOn ? theme.palette.primary.main : theme.palette.text.secondary,
        //overflow:"hidden",
        //  paddingLeft: theme.spacing(1),
        //  paddingRight: theme.spacing(1),
        // wordBreak: "break-all",

        wordBreak: "break-all",
        whiteSpace: "pre-wrap",
        lineBreak: "anywhere",
        //  width:"100%"
        // minHeight: "20vh",
        //theme.typography.fontSize * 10 + "px",

        //whiteSpace: "pre-line",
        //...breakpointsAttribute(["width", "100%", "100%", "75%", "75%", "75%"])
      }
    },

    unstyledBlockCss: () => {
      return {

        paddingLeft: "4px",//theme.spacing(1),
        paddingRight: "4px",//theme.spacing(1),
      }
    },





    className1: props => {

      return {
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
        // fontSize:200,
        '&:hover': { background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)', },
      }
    },



  }
})


const initialState = {
  entityMap: {
    // "0": {
    //     type: "image",
    //     mutability: "IMMUTABLE",
    //     data: {
    //         src:
    //             "https://www.draft-js-plugins.com/images/canada-landscape-small.jpg"
    //     }
    // }
  },
  blocks: [
    // {
    //   key: "1111",
    //   text: "ewijveoij http://weibo.com/aas vvv @mmm fdsfd  \n \n \n \n \n dsd",//`  @aaa @的就是dds http://asd.com `,//  \uD83D\uDE47\u200D\u2640\uFE0F   `,   //  \uD83D\uDE33`,
    //   type: "unstyled",
    //   // type:"unstyled",
    //   depth: 0,
    //   inlineStyleRanges: [
    //     //    {
    //     //         offset: 4,
    //     //         length: 10,
    //     //         style: "HIGHLIGHT"
    //     //    },
    //   ],
    //   entityRanges: [],
    //   data: {}
    // },



    // {
    //   key: "2222",
    //   text: `  @aaa @的就是dds http://asd.com `,//  \uD83D\uDE47\u200D\u2640\uFE0F   `,   //  \uD83D\uDE33`,
    //   type: "unstyled",
    //   depth: 0,

    //   // data: {
    //   //   imgUrl: "https://source.unsplash.com/random/800x800",//"blob:http://localhost:3000/3d815879-af57-4950-a82c-a6301402fa99",
    //   //   imgId: "",
    //   //   imgArr: ["https://source.unsplash.com/random/1300x400", "https://mernchen.herokuapp.com/api/picture/download/5f197ef0452cc60017f9f488", "https://source.unsplash.com/random/800x751", "https://source.unsplash.com/random/100x252"]
    //   // }
    // },


  ]
};

export default function CommentEditor({ postID, index, toHtml }) {

  const {

    token,
    isLight, setIsLight, breakpointsAttribute,
    editorContent,
    setEditorContent,
    lgSizeObj, smSizeObj, deviceSize,


    // backImageArr, setBackImageArr,
    // backImageIndex, setBackImageIndex,
  } = useContext(Context)
  const theme = useTheme()

  // const [picArr,setPicArr] = useState([])



  const [isEmojiPanelOn, setIsEmojiPanelOn] = useState(false)
  const [isMentionPanelOn, setIsMentionPanelOn] = useState(false)



  const [isEditorFocusOn, setIsEditorFocusOn] = useState(false)

  //const [picArr, setPicArr] = useState([])

  const editor = useRef()
  const { editorPaperCss, className1, unstyledBlockCss, imageBlockCss, centerBlockCss, rightBlockCss, colorBlockCss, ...restCss } = useStyles({ isLight, isEditorFocusOn, breakpointsAttribute })

  //console.log(backImageCssArr)
  //const [editorState, setEditorState] = useState(EditorState.createEmpty())
  //const [editorState, setEditorState] = useState(EditorState.createWithContent(ContentState.createFromText('some')))
  const [editorState, setEditorState] = useState(EditorState.createWithContent(convertFromRaw(initialState)))


  const [enablePost, setEnablePost] = useState(true)


  const [commentArr, setCommentArr] = useState([])

  useEffect(function () {
    setTimeout(() => {
      editor.current.focus()
      EditorState.moveFocusToEnd(editorState)
    }, 0);


  
    axios.get(`${url}/comment/${postID}`).then(response=>{
 
      setCommentArr(response.data)
    })

  }, [])

 

  function toPreHtml(editorContent, postID = "local") {


    const preHtml = stateToHTML(
      editorContent.getCurrentContent(),
      {
        defaultBlockTag: "div",

        inlineStyles: {
          //  LARGE: { style: { fontSize: lgSizeObj[deviceSize] }, },
          //  SMALL: { style: { fontSize: smSizeObj[deviceSize] }, },

          //  LARGE: { style: { fontSize:"3.5rem" }},
          //  linkStyle: { style: { fontSize: 0 } }
          //  LARGE: { attributes: { class: "largeText" } },
        },


        blockStyleFn: function (block) {
          const type = block.getType()
          // console.log(type)

          if (type === "unstyled") {
            return {
              attributes: {
                //className: unstyledBlockCss,

              },
              style: {
                //  paddingLeft: "4px",
                //  paddingRight: "4px",
                fontSize: "1.2rem",
              }
            }
          }



        },

        blockRenderers: {

        },

        entityStyleFn: function (entity) {
          const { type, data, mutablity } = entity.toObject()
          if (type === "shortMentionOff") {
            return {
              element: "shortMentionoff",
            }
          }
          if (type === "longMentionOff_HEAD") {

            return {

              element: "longmentionoff_head",
              attributes: {
                imgurl: data.imgurl,
                person: data.person,
              },
              style: {}
            }
          }
          if (type === "longMentionOff_BODY") {

            return {

              element: "longmentionoff_body",
              attributes: {
                imgurl: data.imgurl,
                person: data.person,
              },

            }

          }
          if (type === "EMOJI") {
            console.log(data.url)

            return {
              element: "emoji",
              attributes: {
                imgurl: data.url,
                symbol: data.symbol
              }
            }
          }
          // if (type === "linkOn") {
          //   const {linkType,linkAddress,linkHost} = data
          // }
          if (type === "linkOff") {
            // alert("xxx")
            const { linkType, linkAddress, linkHost } = data
            return {
              element: "linkoff",
              attributes: {
                ...data
              }
            }
          }

        },

      }
    )
    return preHtml
  }


  return (

    <Container disableGutters={true} maxWidth="lg" style={{ backgroundColor: theme.palette.action.disabledBackground, paddingBottom: theme.spacing(1) }}>
      {/* <CssBaseline /> */}
      <Box style={{
        //     marginBottom: "5px",

        display: "flex", alignItems: "center", justifyContent: "flex-start", flexWrap: isMobile ? "wrap" : "wrap",

        gap: theme.spacing(0),

        //   width: "100%",
      }}>


        <Chip


          //style={{ backgroundColor: "transparent" }}

          onClick={function () {
            //  token.userName === postArr[index].ownerName && setOpen(pre => !pre)
          }}

          // classes={{ root: mentionBodyRoot2, label: mentionBodyLabel }}
          key={index}



          avatar={
            < Avatar alt={null}

          

              src={"https://api.multiavatar.com/" + token.userName + ".svg"}   //src={friendObj[person]}
            />
          }
          label={
            <Typography

              style={{ marginTop: "3px", lineHeight: "1.0", fontWeight: "bold", fontSize:"0.9rem" }}>
              {token.userName}

            </Typography>
          }

        />



        {!isMobile && <EmojiIconButton color="primary" fontSize="small" isEmojiPanelOn={isEmojiPanelOn} setIsEmojiPanelOn={setIsEmojiPanelOn} />}

        <Paper style={{ borderRadius: "1000px", transform: "scale(0.8)", padding: "0px" }} elevation={3}>
          <IconButton size="small"
            //    disabled={true}
            style={{


              //        backgroundColor: isEmojiPanelOn ? theme.palette.primary.main : theme.palette.background.paper,// theme.palette.background.default,


              // color: theme.palette.type === "light"
              //   ? isEmojiPanelOn
              //     ? theme.palette.primary.contrastText
              //     : theme.palette.primary.main
              //   : isEmojiPanelOn
              //     ? theme.palette.primary.contrastText
              //     : theme.palette.text.secondary


            }}

            onClick={function () {
              const content = toPreHtml(editorContent)

           

              axios.post(`${url}/comment`,{
                ownerName:token.userName,
                content:content,
                postID:postID,
                postingTime:Date.now()

              }).then(response=>{
                setCommentArr(pre => { return [{
                  ownerName:token.userName,
                  content:content,
                  postID:postID,
                  postingTime:Date.now()
  
                }, ...pre] })

              })

              //alert(JSON.stringify(content))
              //alert(postID)

            }}

          ><Send style={{ transform: "scale(0.9)", color: theme.palette.type === "light" ? theme.palette.primary.main : theme.palette.text.secondary }} /></IconButton></Paper>

     

      </Box>


      <Paper

        elevation={isEditorFocusOn ? 3 : 2}
        //  className={editorPaperClass}
        //  classes={{ root: editorPaperCss }}
        style={{

          marginLeft: "2rem",
          marginRight: "4px",
          fontSize: "1.2rem",
          // backgroundColor: "pink"
          // backgroundImage
          // minHeight: "20vh",
          // backgroundImage:"url(https://source.unsplash.com/random/800x800)",
          // opacity:0.3
        }}
        onClick={function () {

          let editorState_ = EditorState.moveSelectionToEnd(editorState);

          setEditorState(EditorState.forceSelection(editorState_, editorState.getSelection()));
          setIsEditorFocusOn(true)
        }}
      >

        <Editor
          ref={function (element) { editor.current = element; }}
          editorState={editorState}


          onChange={function (newState, { ...props }) {



            const selection = newState.getSelection()




            setIsEditorFocusOn(selection.hasFocus)


            setEditorContent(newState)
            setEditorState(newState)

          }}

          plugins={//chainable(
            [
              emojiPlugin,
              mentionPlugin,
              linkPlugin,

            ]
            // )
          }


          // placeholder="hihihi"
          preserveSelectionOnBlur={true}

          customStyleMap={
            Immutable.Map({
              // stylename1_: {
              //   color: "rgba(200,0,0,1)",

            })
          }

          customStyleFn={function (style, block) {

            const styleNames = style.toObject();

          }}

          blockRenderMap={
            Immutable.Map({
              // 'unstyled': { 
              //   element: 'h3',
              //   wrapper: <Typography variant='body2'/>,
              //  }

              // "colorBlock": {
              //   style: "backgournd-color:red"
              // }
            })
          }



          blockStyleFn={function (block) {
            const type = block.getType()
            const text = block.getText()

            //    const {colorBlockCss0} = useStyles(data.img)

            // console.log(colorBlockCss)

            if (type === "unstyled") {
              return unstyledBlockCss
            }

          }}

          blockRendererFn={function (block) {

            const text = block.getText()
            const data = block.getData().toObject()
            const type = block.getType()
            //   const entityId = editorState.getCurrentContent().getEntityAt(0);

            return null


          }}
          handleKeyCommand={function (command, editorState, evenTimeStamp, { getEditorState }) {


          }}
        />

      </Paper>





      {!isMobile && <EmojiPanel isEmojiPanelOn={isEmojiPanelOn} marginBottom="0" />}

      {/* <MentionPanel isMentionPanelOn={isMentionPanelOn} /> */}

      {/* <div style={{ whiteSpace: "pre-wrap", display: "flex", fontSize: 15 }}>
        <div>{JSON.stringify(editorState.getCurrentContent(), null, 2)}</div>
        <hr />
        <div>{JSON.stringify(convertToRaw(editorState.getCurrentContent()), null, 2)}</div>
      </div> */}

      {/* {toPreHtml(editorContent)} */}


      {commentArr.map(comment => {

        return (
          <>
            <Chip


              //style={{ backgroundColor: "transparent" }}

              onClick={function () {
                //  token.userName === postArr[index].ownerName && setOpen(pre => !pre)
              }}

              // classes={{ root: mentionBodyRoot2, label: mentionBodyLabel }}
              key={index}



              avatar={
                < Avatar alt={null}

               //   style={{ width: "1.5rem", height: "1.5rem", }}

                  src={"https://api.multiavatar.com/" + comment.ownerName + ".svg"}   //src={friendObj[person]}
                />
              }
              label={
                <Typography


                  style={{ marginTop: "3px", lineHeight: "1.0", fontWeight: "bold",fontSize:"0.9rem" }}>
                  {comment.ownerName}
                  &nbsp;<span style={{ color: theme.palette.text.secondary, verticalAlign: "middle", fontSize: "0.7rem", fontWeight: "normal" }}>{formatDistanceToNow(Number(comment.postingTime))}</span>

                </Typography>
              }

            />
            <Paper style={{ marginLeft: "2rem", paddingLeft: "4px", marginRight: "4px", fontSize: "1.2rem", backgroundColor: theme.palette.background.default }}>{toHtml(comment.content, null, null, true)}</Paper>
          </>
        )

      })}








    </Container>
  )

}

