import { useState, useRef, useEffect, useContext, useCallback, createContext, useMemo } from 'react';
import { Context } from "./ContextProvider"


import { EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, AtomicBlockUtils } from 'draft-js';
import Editor from "draft-js-plugins-editor";
import Immutable from 'immutable';

import { makeStyles, styled, useTheme, withStyles } from '@material-ui/core/styles';
import { Typography, Button, ButtonGroup, Container, Paper, Avatar, Box, Chip, Grow } from "@material-ui/core";
import { Image, AlternateEmailSharp } from "@material-ui/icons";

import {
  isMobile,
  isFirefox,
  isChrome,
  browserName,
  engineName,
} from "react-device-detect";

import axios from "axios";




export const useStyles = makeStyles(props => {
  const theme = useTheme()

  return {

    mentionHeadAvatar: props => {
      return {
        position: "absolute",
        top: "50%",
        left: "50%",
        //  width: theme.typography.fontSize + "px",
        //  height: theme.typography.fontSize + "px",
        transform: "translate(-50%, -50%) scale(1)",
      }
    },


    mentionHeadRoot: props => {
      return {
        borderRadius: 999,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,

        position: "relative",

        //width: theme.typography.fontSize,
        height: "100%",

        backgroundColor: theme.palette.mentionBackColor,// "pink",
        position: "relative",
        // boxShadow: "10px 1px 4px -2px rgba(100,100,100,0.75)",
      }
    },


    mentionBodyRoot: props => {
      return {
        borderRadius: 999,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,

        height: "100%",

        backgroundColor: theme.palette.mentionBackColor,//"blue",
        // boxShadow: "0px 1px 4px -2px rgba(100,100,100,0.75)",
      }
    },
    mentionBodyRoot2: props => {
      return {
        borderRadius: 999,
        height: "100%",
        backgroundColor: theme.palette.mentionBackColor,//"blue",
        boxShadow: theme.shadows[2] //"0px 1px 2px 1px rgba(160,160,160,0.75)",
      }
    },



    mentionHeadLabel: props => {
      return {

        //    fontSize: theme.typography.fontSize,
        paddingLeft: 0,
        paddingRight: 0,
        borderStyle: "none",
        //  color: "rgba(200,0,0,0)",
        //   ...(!isMobile) && { color: "rgba(200,0,0,0)" },
        //   clipPath: "circle(0% at 50% 50%)",
        // '&:hover': { padding:0},
      }
    },

    mentionHeadLabel2: props => {
      return {

        //    fontSize: theme.typography.fontSize,
        paddingLeft: 0,
        paddingRight: 0,
        borderStyle: "none",
        color: "rgba(200,0,0,0)",
        // '&:hover': { padding:0},
      }
    },


    mentionBodyLabel: props => {
      return {
        //    fontSize: theme.typography.fontSize,
        borderStyle: "none",
        // '&:hover': { padding:0},
      }
    },




  }
});

export default function createMentionPlugin() {
  //  const url = "http://szwb1.herokuapp.com/api";
  const url = "https://api.multiavatar.com"



  let externalES = null;
  let externalSetEditorState = null;
  //let friendsList = ["mmm", "唐大大", "nbwb"];
  let friendsList = [];
  const friendObj = {}

  friendsList.forEach(friendName => {
    friendObj[friendName] = null
    axios.get(
      //`${url}/avatar/downloadavatar/${friendName}`,
      `${url}/${friendName}.svg`,
      {
        responseType: 'arraybuffer',
        onDownloadProgress: function (progressEvent) { }
      }).then((response) => {
        const base64 = btoa(new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        friendObj[friendName] = "data:" + response.headers["content-type"] + ";base64," + base64
      })


  })

  let tabIndex = 99123;

  function Panel0({ inMentionPanel = false, ...props }) {


    return (
      <div

        contentEditable="false" suppressContentEditableWarning="true"
        style={{ backgroundColor: "pink", position: "absolute", zIndex: 100, width: "max-content" }}

      >
        {friendsList.map(friendName => {
          return (
            <div onMouseDown={function () { alert("xxddssddss") }}>
              {friendName}
            </div>
          )
        })}

      </div>

    )

  }



  function Panel({ inMentionPanel = false, ...props }) {
    const theme = useTheme()
    const [opacity, setOpacity] = useState(0)

    const { mentionHeadKey, mentionBodyKey, entityKey } = props
    const { mentionHeadRoot, mentionBodyRoot, mentionBodyRoot2, mentionHeadAvatar, mentionHeadLabel, mentionHeadLabel2, mentionBodyLabel, } = useStyles();



    useEffect(function () {
      setOpacity(1)
    }, [])

    return (

      <Paper
        elevation={2}

        contentEditable="false" suppressContentEditableWarning="true"
        style={{

          width: "max-content",
          position: "absolute",
          marginTop: theme.spacing(0),
          //  top:0,
          left: "0px",
          zIndex: 122,
          display: "flex",

          flexDirection: "column",
          opacity: opacity,
          transform: `scale(${opacity})`,
          transitionProperty: "opacity,transform",
          transitionDuration: "0.2s",


        }}>


        {friendsList.map(function (friendName, index) {

          return (

            <Chip
              key={index}
              classes={{ root: mentionBodyRoot2, label: mentionBodyLabel }}
              style={{
                backgroundColor: (props.tabIndex % friendsList.length === index)
                  ? theme.palette.mentionBackColor : inMentionPanel ? theme.palette.mentionBackColor : theme.palette.action.disabledBackground,
                // ...(props.tabIndex % friendsList.length === index)&&{ backgroundColor:theme.palette.mentionBackColor}
                cursor: "pointer",
                width: "fit-content"
              }}

              avatar={<Avatar alt="Natacha" src={friendObj[friendName]} />}

              onMouseDown={() => {
                insertMention(inMentionPanel ? " @" + friendName : friendName, mentionHeadKey, mentionBodyKey, entityKey)
              }}

              label={<Typography variant="body2" >{friendName}</Typography>}
            />
          )

        })}




      </Paper>

    )
  }


  function Mention(props) {

    const { contentState, entityKey, blockKey, offsetKey, start, end, decoratedText, children } = props;
    const { mentionHeadKey, mentionBodyKey, person, imgurl, mentionType } = contentState.getEntity(entityKey).getData()
    const theme = useTheme()
    const { mentionHeadRoot, mentionBodyRoot, mentionBodyRoot2, mentionHeadAvatar, mentionHeadLabel, mentionHeadLabel2, mentionBodyLabel, } = useStyles();

    if ((mentionType === "shortMentionOn")) {
      return (
        <span style={{
          position: "relative",
          // display: "inline-block",

        }}>

          <Chip
            style={{ display: "inline-block" }}
            classes={{ root: mentionHeadRoot, avatar: mentionHeadAvatar, label: mentionHeadLabel }}
            avatar={<Avatar alt="Natacha" style={{ opacity: 0.5, }} />}
            label={<Typography variant="body2" style={{ clipPath: "circle(0% at 50% 50%)", }}>{children}</Typography>}
          />
          {!isMobile && <Panel tabIndex={tabIndex} mentionHeadKey={mentionHeadKey} mentionBodyKey={mentionBodyKey} entityKey={entityKey} />}
        </span>
      )
    }
    else if (mentionType === "shortMentionOff") {

      return (
        <span style={{
          position: "relative",
          borderTopLeftRadius: "999px",
          borderBottomLeftRadius: "999px",
        }}>
          {children}
        </span>
      )
    }


    else if (mentionType === "longMentionOnAt_HEAD") {
      return (
        <span style={{
          position: "relative",
          //   display: "inline-block",
        }}>

          <Chip
            classes={{ root: mentionHeadRoot, avatar: mentionHeadAvatar, label: mentionHeadLabel }}
            avatar={<Avatar alt="Natacha" style={{ opacity: 0.5, }} />}
            label={<Typography variant="body2" style={{ clipPath: "circle(0% at 50% 50%)", }}>{children}</Typography>}
          />
          {!isMobile && <Panel tabIndex={tabIndex} mentionHeadKey={mentionHeadKey} mentionBodyKey={mentionBodyKey} entityKey={entityKey} />}
        </span>

      )
    }

    else if (mentionType === "longMentionOnAt_BODY") {
      return (

        <Chip
          classes={{ root: mentionBodyRoot, label: mentionBodyLabel }}
          size="medium"
          label={<Typography variant="body2" >{children}</Typography>}
        />


      )
    }


    ///////////////////////
    ///////////////////////
    else if (mentionType === "longMentionOnOther_HEAD") {


      return (

        // <Chip
        //   classes={{ root: mentionHeadRoot, avatar: mentionHeadAvatar, label: mentionHeadLabel }}
        //   avatar={<Avatar alt="Natacha" style={{}} />}
        //   label={<Typography variant="body2" >{children}</Typography>}
        // />
        <Chip

          classes={{ root: mentionHeadRoot, avatar: mentionHeadAvatar, label: mentionHeadLabel }}
          avatar={<Avatar alt="Natacha" style={{ opacity: 0.5, }} />}
          label={<Typography variant="body2" style={{ clipPath: "circle(0% at 50% 50%)", }}>{children}</Typography>}

        />



      )
    }
    else if (mentionType === "longMentionOnOther_BODY") {
      return (

        <Chip
          classes={{ root: mentionBodyRoot, label: mentionBodyLabel }}
          label={<Typography variant="body2" >{children}</Typography>}
        />


      )
    }
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    else if (mentionType === "longMentionOff_HEAD") {

      return <></>

    }

    else if (mentionType === "longMentionOff_BODY") {



      return <>



        <Chip
          classes={{ root: mentionBodyRoot2, label: mentionBodyLabel }}
          avatar={<Avatar alt="Natacha" src={friendObj[person]||`${url}/${person}.svg`}

          />}
          label={<Typography variant="body2" >{children}</Typography>}
        />

      </>


    }




  }

  function mentionStrategy(contentBlock, callback, contentState) {

    contentBlock.findEntityRanges(
      function (character) {
        const entityKey = character.getEntity();
        return entityKey !== null && contentState.getEntity(entityKey).getType().indexOf("Mention") >= 0
      },
      callback
    );
  }


  function insertMention(friendName, mentionHeadKey, mentionBodyKey, entityKey) {


    const text = friendName + " "
    const contentState = externalES.getCurrentContent();
    const selection = externalES.getSelection();


    const mentionBodyText = mentionBodyKey
      ? contentState.getEntity(mentionBodyKey).getData().person.replace(" @", "")
      : ""

    const [anchorKey, anchorOffset, focusKey, focusOffset, isBackward, hasfocus] = selection.toArray()
    const [anchorStartKey, anchorStartOffset, anchorFocusKey, anchorFocusOffset, isAnchorBackward, isAnchorFocused]
      = [!isBackward ? anchorKey : focusKey, !isBackward ? anchorOffset : focusOffset, isBackward ? anchorKey : focusKey, isBackward ? anchorOffset : focusOffset,]


    let newSelection = selection.merge({
      anchorKey: anchorStartKey,
      anchorOffset: anchorStartOffset,
      focusKey: anchorStartKey,
      focusOffset: anchorStartOffset + mentionBodyText.length,
      isBackward: false,
      hasFocus: true,

    })


    let newContent = Modifier.replaceText(
      contentState,
      newSelection,
      text,
    )

    newSelection = externalES.getSelection().merge({

      anchorKey: anchorStartKey,
      anchorOffset: anchorStartOffset + text.length,
      focusKey: anchorStartKey,
      focusOffset: anchorStartOffset + text.length,
      isBackward: false,
      hasFocus: true,
    })

    externalES = EditorState.push(externalES, newContent, "insert-characters");
    externalES = EditorState.acceptSelection(externalES, newSelection)


    externalSetEditorState(externalES)


  }



  function taggingMention() {

    const [anchorKey, anchorOffset, focusKey, focusOffset, isBackward, hasfocus] = externalES.getSelection().toArray()
    const [anchorStartKey, anchorStartOffset, anchorFocusKey, anchorFocusOffset, isAnchorBackward, isAnchorFocused]
      = [!isBackward ? anchorKey : focusKey, !isBackward ? anchorOffset : focusOffset, isBackward ? anchorKey : focusKey, isBackward ? anchorOffset : focusOffset,]
    const regx = /\s([@][\w_\[\u4E00-\u9FCA\]]*)/g


    const oldSelection = externalES.getSelection();
    let newSelection = externalES.getSelection();
    let newContent = externalES.getCurrentContent();

    externalES.getCurrentContent().getBlocksAsArray().forEach(function (block) {

      const [blockKey, , blockText, metaArr] = block.toArray()


      metaArr.forEach(function (item, index) {
        const itemEntityKey = item.getEntity()
        if (itemEntityKey) {
          const entityType = newContent.getEntity(itemEntityKey).getType()

          if (entityType.indexOf("Mention") >= 0) {

            newSelection = newSelection.merge({
              anchorKey: blockKey,
              anchorOffset: index,
              focusKey: blockKey,
              focusOffset: index + 1,
              isBackward: false,
              hasFocus: false,
            })
            newContent = Modifier.applyEntity(newContent, newSelection, null)
          }
        }
      })


      let matchArr;
      while ((matchArr = regx.exec(blockText)) !== null) {

        const start = matchArr.index;
        const end = matchArr.index + matchArr[0].length;
        const contentLenth = end - start;
        const contentFocusAt = anchorFocusOffset - start;

        const shortMentionOn = (contentLenth === 2) && hasfocus && (blockKey === anchorFocusKey) && (contentFocusAt === 2)
        const shortMentionOff = (contentLenth === 2) && ((!hasfocus) || (blockKey !== anchorFocusKey) || (contentFocusAt !== 2))

        const longMentionOnAt = (contentLenth > 2) && hasfocus && (blockKey === anchorFocusKey) && (contentFocusAt === 2)
        const longMentionOnOther = (contentLenth > 2) && hasfocus && (blockKey === anchorFocusKey) && (contentFocusAt !== 2) && (contentFocusAt > 0) && (contentFocusAt <= contentLenth)

        const longMentionOff = (contentLenth > 2) && ((!hasfocus) || (blockKey !== anchorFocusKey) || (contentFocusAt <= 0) || (contentFocusAt > contentLenth))


        if (shortMentionOn) {
          newContent = newContent.createEntity("shortMentionOn", "MUTABLE", { mentionType: "shortMentionOn" });
          let entityKey = newContent.getLastCreatedEntityKey();
          newSelection = newSelection.merge({
            anchorKey: blockKey,
            focusKey: blockKey,
            anchorOffset: start,
            focusOffset: end,
            isBackward: false,
            hasFocus: false,
          })

          newContent = Modifier.applyEntity(newContent, newSelection, entityKey)

        }
        else if (shortMentionOff) {
          newContent = newContent.createEntity("shortMentionOff", "MUTABLE", { mentionType: "shortMentionOff" });
          let entityKey = newContent.getLastCreatedEntityKey();
          newSelection = newSelection.merge({
            anchorKey: blockKey,
            focusKey: blockKey,
            anchorOffset: start,
            focusOffset: end,
            isBackward: false,
            hasFocus: false,
          })

          newContent = Modifier.applyEntity(newContent, newSelection, entityKey)

        }
        else if (longMentionOnAt) {

          createTag("longMentionOnAt")

        }
        else if (longMentionOnOther) {

          createTag("longMentionOnOther")

        }
        else if (longMentionOff) {
          createTag("longMentionOff")
        }



        function createTag(tagName) {

          newContent = newContent.createEntity(`${tagName}_HEAD`, "MUTABLE", { mentionType: `${tagName}_HEAD` });
          let mentionHeadKey = newContent.getLastCreatedEntityKey();
          newSelection = newSelection.merge({
            anchorKey: blockKey,
            focusKey: blockKey,
            anchorOffset: start,
            focusOffset: start + 2,
            isBackward: false,
            hasFocus: false,
          })

          newContent = Modifier.applyEntity(newContent, newSelection, mentionHeadKey)

          newContent = newContent.createEntity(`${tagName}_BODY`, "MUTABLE", { mentionType: `${tagName}_BODY` });
          let mentionBodyKey = newContent.getLastCreatedEntityKey();
          newSelection = newSelection.merge({
            anchorKey: blockKey,
            focusKey: blockKey,
            anchorOffset: start + 2,
            focusOffset: end,
            isBackward: false,
            hasFocus: false,
          })

          newContent = Modifier.applyEntity(newContent, newSelection, mentionBodyKey)


          newContent = newContent.mergeEntityData(
            mentionHeadKey,
            {
              mentionHeadKey, mentionBodyKey,
              person: blockText.substring(start, end).replace(" @", ""),
              //  imgurl: `url(${url}/avatar/downloadavatar/${blockText.substring(start, end).replace(" @", "")})`
              imgurl: `${url}/${blockText.substring(start, end).replace(" @", "")}).svg`
          
            }
          )

          newContent = newContent.mergeEntityData(
            mentionBodyKey,
            {
              mentionHeadKey, mentionBodyKey,
              person: blockText.substring(start, end).replace(" @", ""),
              //     imgurl: `url(${url}/avatar/downloadavatar/${blockText.substring(start, end).replace(" @", "")})`
              imgurl: `${url}/${blockText.substring(start, end).replace(" @", "")}).svg`
           
            }
          )
        }



      }
    })


    externalES = EditorState.push(externalES, newContent, "apply-entity");
    externalES = EditorState.acceptSelection(externalES, oldSelection);
    return externalES


  }


  function hasOnAtTag() {

    if (friendsList.length <= 0) { return false }

    let isAtOn = false;
    const contentState = externalES.getCurrentContent();
    contentState.getBlocksAsArray().forEach(function (block) {

      const metaArr = block.getCharacterList();
      metaArr.forEach(function (item, index) {

        const tagKey = item.getEntity()
        if (tagKey) {
          const { mentionType, mentionHeadKey, mentionBodyKey } = contentState.getEntity(tagKey).getData()
          if (mentionType) {

            if (mentionType === "shortMentionOn") {
              return isAtOn = [friendsList[tabIndex % friendsList.length], "", "", tagKey]
            }
            else if (mentionType.indexOf("longMentionOnAt") >= 0) {
              return isAtOn = [friendsList[tabIndex % friendsList.length], mentionHeadKey, mentionBodyKey, tagKey]
            }
          }
        }
      })

      if (isAtOn) { return isAtOn }
    })
    return isAtOn
  }

  function MentionButton({ isMentionPanelOn, setIsMentionPanelOn, ...props }) {

    const theme = useTheme()

    return (
      <>
        <Button {...props}

          style={{

            backgroundColor: isMentionPanelOn ? theme.palette.primary.main : "",// theme.palette.background.default,


            color: theme.palette.type === "light"
              ? isMentionPanelOn
                ? theme.palette.primary.contrastText
                : theme.palette.primary.main
              : isMentionPanelOn
                ? theme.palette.primary.contrastText
                : theme.palette.text.secondary


          }}
          onClick={function () {

            setIsMentionPanelOn(pre => !pre)
          }}

        >
          <AlternateEmailSharp />
        </Button>

      </>
    )

  }

  function MentionPanel({ isMentionPanelOn, setIsMentionPanelOn, ...props }) {


    return (
      <Paper
        style={{
          position: "relative",
          // backgroundColor:"skyblue",
          // height:"100px",
          // width:"100px",

        }}

      >
        {isMentionPanelOn && <Panel inMentionPanel={true} />}

      </Paper>
    )
  }


  return {

    mentionPlugin: {


      handleBeforeInput(chars, editorState, evenTimeStamp, { setEditorState }) {

        const [anchorKey, anchorOffset, focusKey, focusOffset, isBackward, hasfocus] = externalES.getSelection().toArray()
        const [anchorStartKey, anchorStartOffset, anchorFocusKey, anchorFocusOffset, isAnchorBackward, isAnchorFocused]
          = [!isBackward ? anchorKey : focusKey, !isBackward ? anchorOffset : focusOffset, isBackward ? anchorKey : focusKey, isBackward ? anchorOffset : focusOffset,]




        if (hasOnAtTag() && isMobile && (!isFirefox)) {
          externalES = editorState;
          externalSetEditorState = setEditorState;

          let newSelection = externalES.getSelection()
          let newContent = externalES.getCurrentContent()

          newSelection = newSelection.merge({
            isBackward: false,
            hasFocus: true,
          })


          newContent = Modifier.replaceText(
            newContent,
            newSelection,
            chars,
          )

          newSelection = newSelection.merge({
            anchorOffset: anchorStartOffset + chars.length * 2,
            focusOffset: anchorFocusOffset + chars.length * 2,
            isBackward: false,
            hasFocus: true,
          })


          externalES = EditorState.push(externalES, newContent, "insert-characters");
          externalES = EditorState.acceptSelection(externalES, newSelection)

          setEditorState(externalES)

          return "handled"
        }

      },

      handleReturn(e, newState, { setEditorState }) {
        //   alert("mention handle return")
        if (hasOnAtTag()) {
          insertMention(...hasOnAtTag())
          return "handled"
        }
        else {
          setEditorState(RichUtils.insertSoftNewline(newState))
          return "handled"

          //////
          const externalES = newState
          let contentState = externalES.getCurrentContent();
          let selection = externalES.getSelection()

          const currentKey = selection.getEndKey()

          let newContentBlockArr = contentState.getBlocksAsArray()

          const currentBlock = contentState.getBlockForKey(currentKey)

          const currentType = currentBlock.getType()

          if ((currentType === "colorBlock") || (currentType === "imageBlock")) {

            setEditorState(RichUtils.insertSoftNewline(newState))
            return "handled"
          }
          else {
            return 'not-handled';
          }


        }

        return 'not-handled';
      },



      keyBindingFn(e, { getEditorState, setEditorState, ...obj }) {

        if ((e.keyCode === 40) && hasOnAtTag()) {
          tabIndex = tabIndex + 1;
          return "fire-arrow";
        }

        else if ((e.keyCode === 38) && hasOnAtTag()) {
          tabIndex = tabIndex - 1;
          return "fire-arrow";
        }

        // else if ((e.keyCode === 13) && hasOnAtTag()) {
        //   return "fire-enter";
        // }


      },

      handleKeyCommand(command, editorState, evenTimeStamp, { setEditorState }) {

        if (command === "fire-arrow") {
          externalSetEditorState(externalES)
          return "handled"
        }

        // if (command === "fire-enter") {
        //   alert("xxdd")
        //   insertMention(...hasOnAtTag())
        //   return "handled"
        // }


        return 'not-handled';
      },


      onChange: function (editorState, { setEditorState }) {
        externalES = editorState
        externalSetEditorState = setEditorState
        externalES = taggingMention()
        return externalES

      },

      decorators: [
        {
          strategy: mentionStrategy,
          component: Mention
        }
      ],

    },

    MentionButton,

    MentionPanel,
  }

}





const formatStringToCamelCase = str => {
  const splitted = str.split("-");
  if (splitted.length === 1) return splitted[0];
  return (
    splitted[0] +
    splitted
      .slice(1)
      .map(word => word[0].toUpperCase() + word.slice(1))
      .join("")
  );
};

const getStyleObjectFromString = str => {
  const style = {};
  str.split(";").forEach(el => {
    const [property, value] = el.split(":");
    if (!property) return;

    const formattedProperty = formatStringToCamelCase(property.trim());
    style[formattedProperty] = value.trim();
  });

  return style;
};