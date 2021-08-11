import { useState, useRef, useEffect, useContext, useCallback, createContext, useMemo } from 'react';



import { EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, AtomicBlockUtils } from 'draft-js';
import Editor from "draft-js-plugins-editor";
import Immutable from 'immutable';

import { makeStyles, styled, useTheme, withStyles } from '@material-ui/core/styles';
import { Typography, Button, ButtonGroup, Container, Paper, Avatar, Box, Chip } from "@material-ui/core";
import { Image, AlternateEmailSharp, DeleteOutlineOutlined, HorizontalSplit, HorizontalSplitOutlined, FormatAlignCenter, FormatAlignRight, PaletteOutlined, Select } from "@material-ui/icons";

import {
  isMobile,
  isFirefox,
  isChrome,
  browserName,
  engineName,
} from "react-device-detect";

export default function createBackColorPlugin() {

  let externalES = null;
  let externalSetEditorState = null;
  let isColorBlockOn = false;

  function addBackColor(editor, imgUrl, textColor) {

    let contentState = externalES.getCurrentContent();
    let selection = externalES.getSelection()

    const currentKey = selection.getEndKey()

    let newContentBlockArr = contentState.getBlocksAsArray()

    const currentBlock = contentState.getBlockForKey(currentKey)

    const currentType = currentBlock.getType()

    // if (currentType !== "unstyled" && currentType !== "centerBlock" && currentType !== "rightBlock") { return }


    contentState = Modifier.setBlockType(contentState, selection, currentType === "colorBlock" ? "colorBlock" : "colorBlock")
    contentState = Modifier.setBlockData(contentState, selection, {img:imgUrl,textColor})
    externalES = EditorState.push(externalES, contentState, "change-block-type");
    externalES = EditorState.acceptSelection(externalES, selection)

    externalSetEditorState(externalES)
    setTimeout(() => {
      editor.current.focus()
    }, 0);


  }





  function AddBackColorButton({ editor, isBackColorPanelOn, setIsBackColorPanelOn, ...props }) {

    const theme = useTheme()
    return <Button {...props}

      style={{

        backgroundColor: isBackColorPanelOn ? theme.palette.primary.main : "",// theme.palette.background.default,


        color: theme.palette.type === "light"
          ? isBackColorPanelOn
            ? theme.palette.primary.contrastText
            : theme.palette.primary.main
          : isBackColorPanelOn
            ? theme.palette.primary.contrastText
            : theme.palette.text.secondary


      }}




      onClick={function () {
        // addBackColor(editor, false)

        setIsBackColorPanelOn(pre => !pre)
      }}
    >
      <PaletteOutlined />
    </Button>

  }


  function BackColorPanel({ editor, isBackColorPanelOn, backImageArr, setBackImageArr, backImageIndex, setBackImageIndex, ...props }) {

    const theme = useTheme()
  


    return (
      <Box
        style={{
          maxWidth: "100%",
          overflow: "auto",
          // marginBottom: "10px",
          marginTop: isBackColorPanelOn ? "10px" : 0,
          //  height: isEmojiPanelOn ? "auto" : 0,
          maxHeight: isBackColorPanelOn ? "35vh" : 0,

          transitionProperty: "height,max-height, opacity",
          transitionDuration: "0.2s",
          opacity: isBackColorPanelOn ? 1 : 0,
          // marginBottom: isEmojiPanelOn ? theme.spacing(2) : 0
          marginBottom: theme.spacing(2),

          display: "flex",
          justifyContent: "space-between",
          flexWrap:"wrap",
        }}>


        {theme.backgourndImageArr.map((img, index) => {
          return (
            <Button
              key={index}
              style={{
                backgroundImage: img.backgroundImage,
                backgroundSize: "contain",
                width: "80px",
                height: "45px",
              }}
              onClick={function () {
              //  alert( img.backgroundImage)
                addBackColor(editor,  img.backgroundImage, img.color||"white")
              }}
            />
          )

        })}

        {/* <Button style={{
          backgroundImage: "url(https://mernchen.herokuapp.com/api/picture/download/60b7028076fa440017fb5779)",
          backgroundSize: "contain",
          width: "80px",
          height: "45px",
        }}>{' '}</Button>

        <Button style={{
          backgroundImage: "url(https://mernchen.herokuapp.com/api/picture/download/60b6f77fae1acf0017a96c4b)",
          backgroundSize: "contain",
          width: "80px",
          height: "45px",
        }}>{' '}</Button>

        <Button style={{
          backgroundImage: "url(https://mernchen.herokuapp.com/api/picture/download/60b701a9dc07780017dcfd38)",
          backgroundSize: "contain",
          width: "80px",
          height: "45px",
        }}>{' '}</Button> */}


      </Box>
    )
  }






  return {


    AddBackColorButton,
    BackColorPanel,

    backColorPlugin: {

      blockStyleFn:function (block) {

      },



      onChange: function (editorState, { setEditorState }) {
        externalES = editorState
        externalSetEditorState = setEditorState
        return externalES

      },

      //  keyBindingFn(e, { getEditorState, setEditorState, ...obj }) {



      // if ((e.keyCode === 13)&&(isColorBlockOn)) {
      //   return "fire-enterX";

      // }


      // },


      // handleReturn(e,editorState,...props){
      //   console.log(props)
      // },


      // handleKeyCommand(command, editorState, evenTimeStamp, { setEditorState }) {


      //  if (command === "fire-enterX") {




      //   externalES = RichUtils.insertSoftNewline(externalES)
      //   setEditorState(externalES)
      //    return "handled"
      //  }


      //  return 'not-handled';
      // },


    }

  }


}




function genKey(length = 4) {

  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}