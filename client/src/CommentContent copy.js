import { useState, useRef, useEffect, useContext, useCallback, createContext, useMemo, Component } from 'react';
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

import { Typography, Button, ButtonGroup, Container, Paper, Box, Avatar, Grid, IconButton, Icon, Chip, Divider, CircularProgress } from "@material-ui/core";

import { Image, Brightness4, Brightness5, FormatBold, FormatItalic, FormatUnderlined, InsertEmoticon, PaletteOutlined, Send, Reply, DeleteOutline, Cancel, ExpandMore } from "@material-ui/icons";
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

  },
  blocks: [


  ]
};


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


export default function CommentContent({ postID, index, toHtml, setCommentCount, commentCount }) {

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
  const commentObjList = useRef([])



  const [replyNum, setReplyNum] = useState(999)

  // const [subCommentCount, setSubCommentCount] = useState(0)



  useEffect(function () {
    setTimeout(() => {
      editor.current.focus()
      EditorState.moveFocusToEnd(editorState)
    }, 0);



    axios.get(`${url}/comment/loadfive/${postID}/${Date.now()}`).then(response => {

      setCommentArr(response.data)

    })

    // axios.get(`${url}/comment/${postID}`).then(response => {

    //   setCommentArr(response.data)

    // })

  }, [])

  function createCommentEditorHeader(isSubCommentEditor = false, commentID) {

    return <Box style={{
      //     marginBottom: "5px",

      display: "flex", alignItems: "center", justifyContent: "flex-start", flexWrap: isMobile ? "wrap" : "wrap",

      gap: theme.spacing(0),
      ...isSubCommentEditor && { marginLeft: "1.6rem" },
  

      //   width: "100%",
    }}>


      <Chip

        // onClick={function () {

        //   alert(commentID)
        // }}
        // classes={{ root: mentionBodyRoot2, label: mentionBodyLabel }}
        key={index}
        avatar={
          < Avatar alt={null}
            src={"https://api.multiavatar.com/" + token.userName + ".svg"}   //src={friendObj[person]}
          />
        }
        label={
          <Typography
            style={{ marginTop: "3px", lineHeight: "1.0", fontWeight: "bold", fontSize: "0.9rem" }}>
            {token.userName}
          </Typography>
        }
      />
      {!isMobile && <EmojiIconButton color="primary" fontSize="small" isEmojiPanelOn={isEmojiPanelOn} setIsEmojiPanelOn={setIsEmojiPanelOn} />}
      <Paper style={{ borderRadius: "1000px", transform: "scale(0.8)", padding: "0px" }} elevation={3}>
        <IconButton size="small"
          //    disabled={true}
          style={{

          }}

          onClick={function () {
            const content = toPreHtml(editorContent)

            if (!commentID) {
              const commentID = String(Math.floor(Math.random() * 1000000))
              axios.post(`${url}/comment`, {
                ownerName: token.userName,
                content: content,
                postID: postID,
                postingTime: Date.now(),
                commentID,

              }).then(response => {
                setCommentArr(pre => {
                  return [{
                    ownerName: token.userName,
                    content: content,
                    postID: postID,
                    postingTime: Date.now(),
                    commentID,
                  }, ...pre]
                })
                setEditorState(EditorState.createWithContent(convertFromRaw(initialState)))
                setCommentCount(pre => Number(pre) + 1)

              })
            }
            else {
              const subCommentID = String(Math.floor(Math.random() * 1000000))
              axios.post(`${url}/subcomment`, {
                ownerName: token.userName,
                content: content,
                postID: postID,
                postingTime: Date.now(),
                commentID,
                subCommentID,

              }).then(response => {
                //  alert(JSON.stringify(response.data))

                console.log(commentObjList.current)

                const subCommentHead = commentObjList.current.find(comment => {

                  return comment.commentID === commentID

                })

                setCommentArr(pre => {
                  // return pre.filter(item => {
                  //   return item.commentID !== comment.commentID
                  // })
                  pre.forEach(item => {
                    if (item.commentID === commentID) {
                      if (item.subCommentCount) { item.subCommentCount++ }
                      else { item.subCommentCount = 1 }
                    }
                  })
                  return pre
                })


                subCommentHead.updateSubCommentArr(response.data)
                setEditorState(EditorState.createWithContent(convertFromRaw(initialState)))


              })


            }
          }}
        ><Send style={{ transform: "scale(0.9)", color: theme.palette.type === "light" ? theme.palette.primary.main : theme.palette.text.secondary }} /></IconButton></Paper>
    </Box >


  }

  function createCommentEditor(isSubCommentEditor = false, commentID) {
    return <>

      {/* {replyNum === 999 && createCommentEditorHeader()} */}


      {createCommentEditorHeader(isSubCommentEditor, commentID)}
      {/* {replyNum !== 999 && <div style={{ margin: theme.spacing(1) }} />} */}




      <Paper

        elevation={isEditorFocusOn ? 3 : 2}
        //  className={editorPaperClass}
        //  classes={{ root: editorPaperCss }}
        style={{

          marginLeft: isSubCommentEditor ? "3.6rem" : "2rem",
          marginRight: "4px",
          fontSize: "1.2rem",
          borderWidth: "2px",
          borderColor: "rgb(63, 81, 181)",
          borderStyle: "solid",

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
      {!isSubCommentEditor && commentArr.length > 0 && <Divider style={{ marginTop: theme.spacing(1) }} />}
    </>
  }

  return (
    <Container disableGutters={true} maxWidth="lg" style={{
      backgroundColor: theme.palette.action.disabledBackground, paddingBottom: theme.spacing(0),
      //height:"auto",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
     // transition: "height 10s",

    }}>

      {(replyNum === 999) && createCommentEditor(false, null)}
      {commentArr.map((comment, listIndex) => {

        return (
          <span key={comment.commentID}>



            <Chip

              style={{verticalAlign:"top"}}

              onClick={function () {
            


                const subCommentHead = commentObjList.current.find(item => {
                  return comment.commentID === item.commentID
                })

                replyNum === listIndex
                  ? subCommentHead.clearSubComments()
                  : subCommentHead.loadSubComments()
                setReplyNum(pre => pre === listIndex ? 999 : listIndex)
                setTimeout(() => {
                  editor.current.focus();
                  EditorState.moveFocusToEnd(editorState);

                }, 0)

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
                  style={{ marginTop: "3px", lineHeight: "1.0", fontWeight: "bold", fontSize: "0.9rem" }}>
                  {comment.ownerName}
                  &nbsp;<span style={{ color: theme.palette.text.secondary, verticalAlign: "middle", fontSize: "0.7rem", fontWeight: "normal" }}>
                    {formatDistanceToNow(Number(comment.postingTime)).replace("less than ", "").replace("about ", "")}
                  </span>
                </Typography>
              }

            />

            <IconButton size="small"
              // style={{  marginTop: "4px" }}
              onClick={function () {
                //  token.userName === postArr[index].ownerName && setOpen(pre => !pre)
                const subCommentHead = commentObjList.current.find(item => {
                  return comment.commentID === item.commentID
                })

                replyNum === listIndex
                  ? subCommentHead.clearSubComments()
                  : subCommentHead.loadSubComments()


                setReplyNum(pre => pre === listIndex ? 999 : listIndex)
                setTimeout(() => {
                  editor.current.focus();
                  EditorState.moveFocusToEnd(editorState);

                }, 0)



              }}
            >
              {replyNum === listIndex
                ? <Cancel style={{ fontSize: "1.2rem", color: theme.palette.text.secondary, }} />
                : <Reply style={{ fontSize: "1.2rem", color: theme.palette.text.secondary, }} />
              }
              <span style={{ fontWeight: "bold", fontSize: "1rem", color: theme.palette.text.secondary, verticalAlign: "middle" }}>
                {comment.subCommentCount}
              </span>

            </IconButton>

            {token.userName == comment.ownerName && <IconButton size="small"
              style={{ float: "right", marginTop: "4px" }}
              onClick={function () {

                setCommentArr(pre => {
                  return pre.filter(item => {
                    return item.commentID !== comment.commentID
                  })
                })

                axios.get(`${url}/comment/deletecomment/${comment.commentID}`).then(response => {
                  //  alert(JSON.stringify(response.data))
                  setCommentCount(pre => Number(pre) - 1)
                })
              }}
            >
              <DeleteOutline style={{ fontSize: "1.5rem" }} />
            </IconButton>}

            <Paper style={{ marginLeft: "2rem", paddingLeft: "4px", paddingRight: "4px", marginRight: "4px", fontSize: "1.2rem", backgroundColor: theme.palette.background.default }}>
              {toHtml(comment.content, null, null, true)}
            </Paper>

            {(replyNum === listIndex) && createCommentEditor(true, comment.commentID)}


            <SubComments setReplyNum={setReplyNum} replyNum={replyNum} listIndex={listIndex}
              commentArr={commentArr} toHtml={toHtml} comment={comment} theme={theme} index={index} editor={editor}
              commentObjList={commentObjList}
              setCommentArr={setCommentArr}
              token={token}
            />


            {(listIndex !== commentArr.length - 1) && <Divider light={false} style={{ marginTop: "8px" }} />}




          </span>
        )

      })}


      {commentArr.length < commentCount
        ? <Button

          onClick={function () {


            const postingTime = Math.min(...commentArr.map(item => item.postingTime))
            const postID = commentArr.find(item => item.postingTime === postingTime).postID
            axios.get(`${url}/comment/loadfive/${postID}/${postingTime}`).then(response => {
              setCommentArr(pre => { return [...pre, ...response.data] })


            })
          }}

          style={{
            marginTop: "8px",
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            padding: 0, boxShadow: theme.shadows[0],
            color: theme.palette.type === "dark"
              ? theme.palette.text.secondary
              : theme.palette.primary.main
          }}
          size="small" disableElevation fullWidth={true}
        >
          {/* <CircularProgress size="1rem" style={{
            color: theme.palette.type === "dark"
              ? theme.palette.text.secondary
              : theme.palette.primary.main
          }} /> */}
          <ExpandMore />&nbsp;{commentArr.length}/{commentCount}
        </Button>
        : <div style={{ marginTop: "16px" }}></div>
      }
    </Container>
  )

}


class SubComments extends Component {

  constructor(props, context) {
    super(props, context)


    this.commentID = this.props.comment.commentID
    this.state = { subCommentArr: [] }

  }

  //shouldComponentUpdate(nextProps, nextState) { }
  //componentDidUpdate(prevProps) { }

  updateSubCommentArr = (obj) => {

    this.setState(pre => {
      const arr = pre.subCommentArr;
      // if (arr.findIndex(aaa => { return aaa.subCommentID === obj.subCommentID }) >= 0) {
      //   return pre
      // }
      return {
        subCommentArr: [obj, ...arr,]
      }

    })

  }

  loadSubComments = () => {
    axios.get(`${url}/subcomment/${this.props.comment.commentID}`).then(response => {

      //   alert(comment.commentID+JSON.stringify(response.data))

      this.setState(pre => {
        return pre.subCommentArr = response.data
      })

      this.props.commentObjList.current.push(this)


    })
  }

  clearSubComments = () => {
    this.setState(pre => {
      return pre.subCommentArr = []
    })

  }




  componentDidMount() {

    this.props.commentObjList.current.push(this)
    // console.log(this.props.commentID + "-----")
    // axios.get(`${url}/subcomment/${this.props.comment.commentID}`).then(response => {

    //   //   alert(comment.commentID+JSON.stringify(response.data))

    //   this.setState(pre => {
    //     return pre.subCommentArr = response.data
    //   })

    //   this.props.commentObjList.current.push(this)


    // })


  }


  render() {
    return (
      <>



        {this.state.subCommentArr.map((subComment, subListIndex) => {

          return <span key={subComment.subCommentID}>

            <Chip
              style={{
                marginLeft: "1.6rem"
              }}
              onClick={() => {
                // token.userName === postArr[index].ownerName && setOpen(pre => !pre)
                // setReplyNum(listIndex)
                // setTimeout(() => {
                //   editor.current.focus();
                //   EditorState.moveFocusToEnd(editorState);

                // }, 0)
                //alert(JSON.stringify(comment))
              }}

              // classes={{ root: mentionBodyRoot2, label: mentionBodyLabel }}

              avatar={
                < Avatar alt={null}
                  //   style={{ width: "1.5rem", height: "1.5rem", }}
                  src={"https://api.multiavatar.com/" + subComment.ownerName + ".svg"}   //src={friendObj[person]}
                />
              }
              label={
                <Typography
                  style={{ marginTop: "3px", lineHeight: "1.0", fontWeight: "bold", fontSize: "0.9rem" }}>
                  {subComment.ownerName}
                  &nbsp;<span style={{ color: this.props.theme.palette.text.secondary, verticalAlign: "middle", fontSize: "0.7rem", fontWeight: "normal" }}>
                    {formatDistanceToNow(Number(subComment.postingTime)).replace("less than ", "").replace("about ", "")}
                  </span>
                </Typography>
              }

            />

            {this.props.token.userName === subComment.ownerName &&
              <IconButton size="small"
                style={{ float: "right", marginTop: "4px" }}
                onClick={() => {


                  axios.get(`${url}/subcomment/deletesubcomment/${subComment.subCommentID}`).then(reponse => {
                    this.setState(pre => {
                      return {
                        subCommentArr: pre.subCommentArr.filter(item => { return item.subCommentID !== subComment.subCommentID })
                      }

                    })


                    //  alert(this.commentID)

                    this.props.setCommentArr(pre => {
                      // return pre.filter(item => {
                      //   return item.commentID !== comment.commentID
                      // })
                      pre.forEach(item => {
                        if (item.commentID === this.commentID) {
                          if (item.subCommentCount) { item.subCommentCount-- }
                          else { item.subCommentCount = 1 }
                        }
                      })
                      return [...pre]
                    })



                  })
                }}
              >
                <DeleteOutline style={{ fontSize: "1.5rem" }} />
              </IconButton>
            }

            <Paper style={{ marginLeft: "3.6rem", paddingLeft: "4px", paddingRight: "4px", marginRight: "4px", fontSize: "1.2rem", backgroundColor: this.props.theme.palette.background.default }}>
              {this.props.toHtml(subComment.content, null, null, true)}
            </Paper>



          </span>

        })
        }




      </>
    )


  }
}





