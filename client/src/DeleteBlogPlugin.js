import { useState, useRef, useEffect, useContext, useCallback, createContext, useMemo } from 'react';
import { Context } from "./ContextProvider"


import { EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, AtomicBlockUtils } from 'draft-js';
import Editor from "draft-js-plugins-editor";
import Immutable from 'immutable';

import { makeStyles, styled, useTheme, withStyles } from '@material-ui/core/styles';
import { Typography, Button, ButtonGroup, Container, Paper, Avatar, Box, Chip } from "@material-ui/core";
import { Image, AlternateEmailSharp, DeleteOutlineOutlined, HorizontalSplit, HorizontalSplitOutlined, FormatAlignCenter, FormatAlignRight, PaletteOutlined ,Select  } from "@material-ui/icons";


import {
  isMobile,
  isFirefox,
  isChrome,
  browserName,
  engineName,
} from "react-device-detect";

export default function createDeleteBlogPlugin() {

  let externalES = null;
  let externalSetEditorState = null;


  function deleteBlock(editor) {

    let contentState = externalES.getCurrentContent();
    let selection = externalES.getSelection()

    const currentKey = selection.getEndKey()

    let newContentBlockArr = contentState.getBlocksAsArray()

    const currentBlock = contentState.getBlockForKey(currentKey)

    const currentType = currentBlock.getType()

    if ((currentType !== "unstyled") && (currentType !== "centerBlock") && (currentType !== "rightBlock") && (currentType !== "colorBlock")) { return }

    if (newContentBlockArr.length <= 1) {
      externalES = EditorState.createEmpty()
      setTimeout(() => {
        externalSetEditorState(externalES)
        editor.current.focus()
      }, 0);
      return null
    }



    newContentBlockArr = newContentBlockArr.filter((item) => {
      return item.key !== currentKey
    })

    contentState = ContentState.createFromBlockArray(newContentBlockArr)
    externalES = EditorState.createWithContent(contentState)

    // setTimeout(() => {
    externalSetEditorState(externalES)
    // }, 0);
    return externalES

  }

  function addTopLine(editor, isTopLine = true) {
    let contentState = externalES.getCurrentContent();
    let selection = externalES.getSelection()
    const selectionBefore = contentState.getSelectionBefore()
    const selectionAfter = contentState.getSelectionAfter()
    const currentKey = selection.getEndKey()
    let newContentBlockArr = contentState.getBlocksAsArray()
    const currentBlock = contentState.getBlockForKey(currentKey)
    const currentType = currentBlock.getType()


    const key = genKey()
    newContentBlockArr =
      isTopLine
        ? [new ContentBlock({ key, type: "unstyled", text: '', }), ...newContentBlockArr]
        : [...newContentBlockArr, new ContentBlock({ key, type: "unstyled", text: '', }),]

    contentState = ContentState.createFromBlockArray(newContentBlockArr)


    selection = selection.merge({
      anchorKey: key,
      focusKey: key,
      anchorOffset: 0,
      focusOffset: 0,
      isBackward: false,
      hasFocus: true,
    })


    externalES = EditorState.createWithContent(contentState)
    //  externalES = EditorState.push(externalES, contentState, 'insert-fragment');
    externalES = EditorState.acceptSelection(externalES, selection);
    externalSetEditorState(externalES)
    setTimeout(() => {
      editor.current.focus()
    }, 0);
    return externalES


  }

  function centerBlock(editor, pos = "centerBlock") {

    let contentState = externalES.getCurrentContent();
    let selection = externalES.getSelection()

    const currentKey = selection.getEndKey()

    let newContentBlockArr = contentState.getBlocksAsArray()

    const currentBlock = contentState.getBlockForKey(currentKey)

    const currentType = currentBlock.getType()

    if (currentType !== "unstyled" && currentType !== "centerBlock" && currentType !== "rightBlock") { return }

    contentState = Modifier.setBlockType(contentState, selection, currentType === "unstyled" ? pos : currentType === pos ? "unstyled" : pos)

        

    externalES = EditorState.push(externalES, contentState, "change-block-type");
    externalES = EditorState.acceptSelection(externalES, selection)

    externalSetEditorState(externalES)
    setTimeout(() => {
      editor.current.focus()
    }, 0);

  }

  function addBackColor(editor){

    let contentState = externalES.getCurrentContent();
    let selection = externalES.getSelection()

    const currentKey = selection.getEndKey()

    let newContentBlockArr = contentState.getBlocksAsArray()

    const currentBlock = contentState.getBlockForKey(currentKey)

    const currentType = currentBlock.getType()


    contentState = Modifier.setBlockType(contentState, selection, "colorBlock" )

    externalES = EditorState.push(externalES, contentState, "change-block-type");
    externalES = EditorState.acceptSelection(externalES, selection)

    externalSetEditorState(externalES)
    setTimeout(() => {
      editor.current.focus()
    }, 0);


  }



  function DeleteBlogButton({ editor, ...props }) {

    const theme = useTheme()
    return (

      <Button {...props}

        style={{

          color: theme.palette.type === "light"
            ? theme.palette.primary.main
            : theme.palette.text.secondary
        }}
        onClick={function () {
          deleteBlock(editor)
          // topImage(editor)
        }}

      >
        <DeleteOutlineOutlined />
      </Button>

    )
  }

  function AddTopLineButton({ editor, ...props }) {

    const theme = useTheme()
    return <Button {...props}

      style={{
        color: theme.palette.type === "light"
          ? theme.palette.primary.main
          : theme.palette.text.secondary
      }}
      onClick={function () {
        addTopLine(editor)
      }}

    >
      <HorizontalSplitOutlined style={{ transform: "rotate(180deg)" }} />
    </Button>
  }

  function AddBottomLineButton({ editor, ...props }) {

    const theme = useTheme()
    return <Button {...props}

      style={{
        color: theme.palette.type === "light"
          ? theme.palette.primary.main
          : theme.palette.text.secondary
      }}
      onClick={function () {
        addTopLine(editor, false)
      }}

    >
      <HorizontalSplitOutlined />
    </Button>
  }

  function AlignCenterButton({ editor, isCenterOn, setIsCenterOn, ...props }) {


    const theme = useTheme()
    return <Button {...props}

      style={{
        backgroundColor: isCenterOn ? theme.palette.primary.main : "",// theme.palette.background.default,
        color: theme.palette.type === "light"
          ? isCenterOn
            ? theme.palette.primary.contrastText
            : theme.palette.primary.main
          : isCenterOn
            ? theme.palette.primary.contrastText
            : theme.palette.text.secondary
      }}
      onClick={function () {
        centerBlock(editor, "centerBlock")
      }}

    >
      <FormatAlignCenter />
    </Button>
  }

  function AlignRightButton({ editor, isRightOn, setIsRightOn, ...props }) {


    const theme = useTheme()
    return <Button {...props}

      style={{
        backgroundColor: isRightOn ? theme.palette.primary.main : "",// theme.palette.background.default,
        color: theme.palette.type === "light"
          ? isRightOn
            ? theme.palette.primary.contrastText
            : theme.palette.primary.main
          : isRightOn
            ? theme.palette.primary.contrastText
            : theme.palette.text.secondary
      }}
      onClick={function () {
        centerBlock(editor, "rightBlock")
      }}

    >
      <FormatAlignRight />
    </Button>
  }

  function AddBackColorButton({editor,...props}){

    const theme = useTheme()
    return <Button {...props}
      style={{
        color: theme.palette.type === "light"
          ? theme.palette.primary.main
          : theme.palette.text.secondary
      }}
      onClick={function () {
        addBackColor(editor, false)
      }}
    >
      <PaletteOutlined />
    </Button>

  }


  function BackColorPanel({...props}){


    return(
      <>
ddd
      </>
    )
  }






  return {

    DeleteBlogButton,
    AddTopLineButton,
    AddBottomLineButton,
    AlignCenterButton,
    AlignRightButton,
    AddBackColorButton,
    BackColorPanel,

    deleteBlogPlugin: {
      onChange: function (editorState, { setEditorState }) {
        externalES = editorState
        externalSetEditorState = setEditorState

        return externalES

      },
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