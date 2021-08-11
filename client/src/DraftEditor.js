import { useState, useRef, useEffect, useContext, useCallback, createContext, useMemo } from 'react';
import { Context } from "./ContextProvider"


import { EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, AtomicBlockUtils } from 'draft-js';
import Editor from "draft-js-plugins-editor";
import Immutable from 'immutable';

import chainable from 'draft-js-plugins-chainable';

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

import { Typography, Button, ButtonGroup, Container, Paper, Box, Avatar, Grid } from "@material-ui/core";
import { Image, Brightness4, Brightness5, FormatBold, FormatItalic, FormatUnderlined, InsertEmoticon, PaletteOutlined } from "@material-ui/icons";
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
const { emojiPlugin, EmojiButton, EmojiPanel } = createEmojiPlugin()
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

        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
      }
    },
    imageBlockCss: () => {
      return {
        margin: 0,
        padding: 0,
        //   position: "relative",
        width: "100%",
        height: 0,
        paddingBottom: "56.25%",
      }
    },
    centerBlockCss: () => {
      return {
        // display: "flex",
        // justifyContent: "center",
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        textAlign: "center",
      }

    },
    rightBlockCss: () => {
      return {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        textAlign: "end",

      }
    },




    colorBlockCss: () => {
      // console.log(backImageArr, backImageIndex)
      // if (!backImageArr) { return {} }
      return {
        position: "relative",
        display: "flex",
        backgroundColor: "wheat",
        // width:"100%",
        height: 0,
        paddingBottom: "56.25%",
        alignItems: "center",
        justifyContent: "center",

        overflow: "auto",
        // overflow: "hidden",

        // backgroundImage: "url(https://mernchen.herokuapp.com/api/picture/download/60a204e70270cc001728285f)",
        // backgroundImage: "url(https://mernchen.herokuapp.com/api/picture/download/60a2062e95f2250017420aa4)",
        //  backgroundImage: "url(https://mernchen.herokuapp.com/api/picture/download/60b701a9dc07780017dcfd38)",
        //    backgroundImage: backImageArr[backImageIndex],

        //  backgroundImage: "url(https://mernchen.herokuapp.com/api/picture/download/60b6f77fae1acf0017a96c4b)",
        //  backgroundImage: "url(https://picsum.photos/800/450)",
        backgroundSize: "contain",
        //color:"white",
        // aspectRatio: "16 / 9",

        "& > div": {
          textAlign: "center",
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          // color: "pink",

        }




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

export default function DraftEditor() {

  const {

    token,
    isLight, setIsLight, breakpointsAttribute,
    editorContent,
    setEditorContent,
    lgSizeObj, smSizeObj, deviceSize,
    picArr, setPicArr,
    postArr, setPostArr,
    postPicArr, setPostPicArr,
    // backImageArr, setBackImageArr,
    // backImageIndex, setBackImageIndex,
  } = useContext(Context)
  const theme = useTheme()

  // const [picArr,setPicArr] = useState([])

  const [isBoldOn, setIsBoldOn] = useState(false)
  const [isItalicOn, setIsItalicOn] = useState(false)
  const [isUnderlineOn, setIsUnderlineOn] = useState(false)
  const [isLargeOn, setIsLargeOn] = useState(false)
  const [isSmallOn, setIsSmallOn] = useState(false)


  const [isEmojiPanelOn, setIsEmojiPanelOn] = useState(false)
  const [isMentionPanelOn, setIsMentionPanelOn] = useState(false)
  const [isBackColorPanelOn, setIsBackColorPanelOn] = useState(false)

  const [isCenterOn, setIsCenterOn] = useState(false)
  const [isRightOn, setIsRightOn] = useState(false)


  const [isEditorFocusOn, setIsEditorFocusOn] = useState(false)

  //const [picArr, setPicArr] = useState([])

  const editor = useRef()
  const { editorPaperCss, className1, unstyledBlockCss, imageBlockCss, centerBlockCss, rightBlockCss, colorBlockCss, ...restCss } = useStyles({ isLight, isEditorFocusOn, breakpointsAttribute })

  //console.log(backImageCssArr)
  //const [editorState, setEditorState] = useState(EditorState.createEmpty())
  //const [editorState, setEditorState] = useState(EditorState.createWithContent(ContentState.createFromText('some')))
  const [editorState, setEditorState] = useState(EditorState.createWithContent(convertFromRaw(initialState)))


  const [enablePost, setEnablePost] = useState(true)




  useEffect(function () {
    setTimeout(() => {
      editor.current.focus()
      EditorState.moveFocusToEnd(editorState)
    }, 0);
  }, [])


  function toPreHtml(editorContent, postID = "local") {


    const preHtml = stateToHTML(
      editorContent.getCurrentContent(),
      {
        defaultBlockTag: "div",

        inlineStyles: {
          LARGE: { style: { fontSize: lgSizeObj[deviceSize] }, },
          //   LARGE: { style: { fontSize:"3.5rem" }},
          SMALL: { style: { fontSize: smSizeObj[deviceSize] }, },
          //   linkStyle: { style: { fontSize: 0 } }
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
                paddingLeft: "8px",
                paddingRight: "8px",
              }
            }
          }
          if (type === "centerBlock") {
            return {
              attributes: {
                className: centerBlockCss,
              },
            }
          }
          if (type === "rightBlock") {
            return {
              attributes: {
                className: rightBlockCss,
              },

            }
          }
          if (type === "imageBlock") {

          }
          if (type === "colorBlock") {

            return {
              attributes: {

                colorblock: "true",
                backimage: block.getData().toJS().img,
                textcolor: block.getData().toJS().textColor,
              },
              // style: {
              //   backgroundImage: block.getData().toJS().img,//"url(https://mernchen.herokuapp.com/api/picture/download/60a204e70270cc001728285f)",
              //   color:block.getData().toJS().textColor,
              // },
            }
          }
        },

        blockRenderers: {
          imageBlock: function (block) {
            const text = block.getText()
            const data = block.getData().toObject()
            const type = block.getType()

            //  return `<img src=${data.imgUrl} style=max-width:300px;display:block;margin-left:auto;margin-right:auto;/>`
            //  return `<imgtag id=${data.imgId} style=max-width:100%;display:block;margin-left:auto;margin-right:auto;/>`
            return `<imgtag id="${postID}">` + escape(block.getText()) + '</imgtag>'
            // return `<div>ffd</div>`
            // return '<imgtag />'
          },
          // colorBlock: function (block) {
          //   return `<colorBlock>` + (block.getText()) + `</colorBlock>`
          // },
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

    <Container disableGutters={false}>

      {/* <Avatar />lorem jkdlks */}
      {/* <Avatar src={"https://i.pravatar.cc/300"} /> */}
      {/* <Typography gutterBottom variant="body2" color="textSecondary" noWrap align="right">lorem jdlks djlsfjlkj lkjfljeoiw lkj fdsoij dfslk  jlkfdj jkdjf  fjdkj  kjdlsjd  jeiwohj hdflshjl ljoisdo</Typography> */}


      <Box style={{
        marginBottom: "5px",

        display: "flex", alignItems: "center", justifyContent: "flex-start", flexWrap: isMobile ? "wrap" : "wrap",

        gap: theme.spacing(1),
        //   width: "100%",
      }}>
        <Paper
          //    elevation
          style={{

            ...(isMobile && !isFirefox) && { marginRight: theme.spacing(1) },
            display: "flex", alignItems: "center", justifyContent: "flex-start", flexWrap: "wrap",
            gap: theme.spacing(1),
            width: "fit-content",
          }}>
          <ButtonGroup variant="text" style={{}}>

            <BoldButton editor={editor} isBoldOn={isBoldOn} setIsBoldOn={setIsBoldOn} />
            <ItalicButton editor={editor} isItalicOn={isItalicOn} setIsItalicOn={setIsItalicOn} />
            <UnderlineButton editor={editor} isUnderlineOn={isUnderlineOn} setIsUnderlineOn={setIsUnderlineOn} />

            <LargeButton editor={editor} isLargeOn={isLargeOn} setIsLargeOn={setIsLargeOn} />
            <SmallButton editor={editor} isSmallOn={isSmallOn} setIsSmallOn={setIsSmallOn} />

            {/* <CenterButton editor={editor} isCenterOn={isCenterOn} setIsCenterOn={setIsCenterOn} /> */}

          </ButtonGroup>
        </Paper>
        <Paper
          style={{

            display: "flex", alignItems: "center", justifyContent: "flex-start", flexWrap: "wrap",
            gap: theme.spacing(1),
            width: "fit-content",
          }}>
          <ButtonGroup variant="text" style={{}}>

            {!isMobile && <EmojiButton color="primary" fontSize="small" isEmojiPanelOn={isEmojiPanelOn} setIsEmojiPanelOn={setIsEmojiPanelOn} />}

            <MentionButton color="primary" fontSize="small" isMentionPanelOn={isMentionPanelOn} setIsMentionPanelOn={setIsMentionPanelOn} />

            <ImageButton color="primary" fontSize="small" picArr={picArr} setPicArr={setPicArr} editor={editor} />
            <AddBackColorButton editor={editor} color="primary" fontSize="small" isBackColorPanelOn={isBackColorPanelOn} setIsBackColorPanelOn={setIsBackColorPanelOn} />

            <Button
              onClick={function () { setIsLight(pre => !pre); editor.current.focus() }}
              style={{ color: theme.palette.type === "dark" ? theme.palette.text.secondary : theme.palette.primary.main }}
            >
              {isLight ? <Brightness5 /> : <Brightness4 />}
            </Button>


            {/* <TopImageButton color="primary" fontSize="small"  editor={editor} />  */}
          </ButtonGroup>
        </Paper>
        <Paper
          style={{

            display: "flex", alignItems: "center", justifyContent: "flex-start", flexWrap: "wrap",
            gap: theme.spacing(1),
            width: "fit-content",
          }}>
          <ButtonGroup variant="text" style={{}}>
            <AddTopLineButton editor={editor} />
            <DeleteBlogButton editor={editor} />
            <AddBottomLineButton editor={editor} />
            <AlignCenterButton editor={editor} isCenterOn={isCenterOn} setIsCenterOn={setIsCenterOn} />
            <AlignRightButton editor={editor} isRightOn={isRightOn} setIsRightOn={setIsRightOn} />

          </ButtonGroup>
        </Paper>

      </Box>


      <Paper

        elevation={isEditorFocusOn ? 5 : 1}
        //  className={editorPaperClass}
        classes={{ root: editorPaperCss }}
        style={{
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


            const { BOLD, ITALIC, UNDERLINE, LARGE, SMALL } = newState.getCurrentInlineStyle().toObject()
            const selection = newState.getSelection()
            const contentState = newState.getCurrentContent()
            const currentKey = selection.getFocusKey()
            const currentBlock = contentState.getBlockForKey(currentKey)
            const currentType = currentBlock.getType()

            setIsCenterOn(currentType === "centerBlock")
            setIsRightOn(currentType === "rightBlock")
            //  setIsBackColorPanelOn(currentType === "colorBlock")

            setIsEditorFocusOn(selection.hasFocus)

            setIsBoldOn(Boolean(BOLD))
            setIsItalicOn(Boolean(ITALIC))
            setIsUnderlineOn(Boolean(UNDERLINE))
            setIsLargeOn(Boolean(LARGE))
            setIsSmallOn(Boolean(SMALL))

            setEditorContent(newState)
            setEditorState(newState)

          }}

          plugins={//chainable(
            [
              //    focusPlugin,
              boldPlugin,
              imagePlugin,
              emojiPlugin,
              mentionPlugin,
              linkPlugin,
              deleteBlogPlugin,
              backColorPlugin,
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

            if (styleNames.LARGE && styleNames.SMALL) {

            }
            else if (Boolean(styleNames.LARGE)) {
              return {
                //color: "red",  // display:"flex",   // justifyContent:"center",
                fontSize: lgSizeObj[deviceSize],
              }
            }
            else if (Boolean(styleNames.SMALL)) {
              return {
                //color: "blue", 
                fontSize: smSizeObj[deviceSize]
              }
            }
            else if (Boolean(styleNames.CENTER)) {

              return {
                display: "flex",
                justifyContent: "center",
              }
            }
            else {

            }
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
            if ((type === "atomic") && (text === "imageBlockText")) {
              return imageBlockCss
            }
            if (type === "centerBlock") {
              return centerBlockCss
            }
            if (type === "rightBlock") {
              return rightBlockCss
            }
            if (type === "colorBlock") {
              console.log(restCss)
              const imgUrl = block.getData().toJS().img
              const index = theme.backgourndImageArr.findIndex(item => {
                return item.backgroundImage === imgUrl
              })

              return colorBlockCss + " " + restCss["css" + index]
            }
          }}

          blockRendererFn={function (block) {

            const text = block.getText()
            const data = block.getData().toObject()
            const type = block.getType()
            //   const entityId = editorState.getCurrentContent().getEntityAt(0);
            if (((type === "atomic") && (text === "imageBlockText")) || (type === "imageBlock")) {
              //   console.log(JSON.stringify(data))
              return {
                component: function AAA(props) { return <ImageBlog {...props} picArr={picArr} setPicArr={setPicArr} editor={editor} /> },
                editable: false
              }
            }

            else {
              return null
            }

          }}
          handleKeyCommand={function (command, editorState, evenTimeStamp, { getEditorState }) {

            if (command === "bold") {
              setIsBoldOn(pre => !pre)

              setEditorState(RichUtils.handleKeyCommand(editorState, command))
            }
            else if (command === "italic") {
              setIsItalicOn(pre => !pre)

              setEditorState(RichUtils.handleKeyCommand(editorState, command))
            }
            else if (command === "underline") {
              setIsUnderlineOn(pre => !pre)

              setEditorState(RichUtils.handleKeyCommand(editorState, command))
            }
          }}
        />

      </Paper>

      <Button variant="contained" color="primary" disabled={!enablePost}

        style={{ display: "block", width: "100%", marginTop: theme.spacing(1) }}
        onClick={function (e) {

          editor.current.focus()
          setEnablePost(false)

          const postID = String(Math.floor(Math.random() * 1000000)) + "_" + picArr.length


          axios.post(`${url}/article`, {
            ownerName: token.userName,
            content: toPreHtml(editorContent, postID),
            postID,
          }).then((response) => {


            console.log(response.data)
            if (picArr.length === 0) {
              setEnablePost(true)

              setEditorState(EditorState.createWithContent(convertFromRaw(initialState)))
            }
          })


          if (picArr.length > 0) {

            const data = new FormData();
            const obj = { ownerName: "aaa", picName: [] };
            picArr.forEach((pic, index) => {
              const picID = postID + "_" + index
              data.append('file', pic)
              obj.picName.push(picID)
              pic.picID = picID
              console.log(picID)
            })


            data.append('obj', JSON.stringify(obj));

            axios.post(`${url}/picture/uploadpicture`, data, {
              headers: { 'content-type': 'multipart/form-data' },
            }).then(response => {
              setEnablePost(true)
              setPicArr([])
              setEditorState(EditorState.createWithContent(convertFromRaw(initialState)))
            })

          }



          setPostArr(pre => { return [{ ownerName: token.userName, postID, postingTime: Date.now(), content: toPreHtml(editorContent, "local") }, ...pre,] })
          setPostPicArr(pre => { return [picArr, ...pre,] })

        }}
      >Post</Button>

      <BackColorPanel
        editor={editor}
        isBackColorPanelOn={isBackColorPanelOn}

      />

      {!isMobile && <EmojiPanel isEmojiPanelOn={isEmojiPanelOn} />}

      <MentionPanel isMentionPanelOn={isMentionPanelOn} />

      {/* <div style={{ whiteSpace: "pre-wrap", display: "flex", fontSize: 15 }}>
        <div>{JSON.stringify(editorState.getCurrentContent(), null, 2)}</div>
        <hr />
        <div>{JSON.stringify(convertToRaw(editorState.getCurrentContent()), null, 2)}</div>
      </div> */}

      {/* {toPreHtml(editorContent)} */}
    </Container>
  )

}

