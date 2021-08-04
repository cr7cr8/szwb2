import React, { useState, useRef, useEffect } from 'react';

import Immutable from 'immutable'
import axios from "axios"


import { Typography, Button, ButtonGroup, Container, IconButton } from "@material-ui/core";
import { CropOriginal, Image, Brightness4, Brightness5, FormatBold, FormatItalic, FormatUnderlined, FormatSize, TextFieldsOutlined,FormatAlignCenter } from "@material-ui/icons";
import { makeStyles, styled, useTheme } from '@material-ui/core/styles';


import {
  EditorState, ContentBlock,
  CharacterMetadata, SelectionState, convertToRaw,
  convertFromRaw, RichUtils, Modifier, convertFromHTML,
  AtomicBlockUtils,

}
  from 'draft-js';
import { set } from 'immutable';

export default function createBoldPlugin() {
  let externalES = null;
  let externalSetEditorState = null;

  function makeBold(styleType, setOn) {

    const isCollapsed = externalES.getSelection().isCollapsed()

    if (!isCollapsed) {

      externalES = RichUtils.toggleInlineStyle(externalES, styleType)
      let selection = externalES.getSelection()
      const [anchorKey, anchorOffset, focusKey, focusOffset, isBackward, hasfocus] = selection.toArray()





      // selection = selection.merge({

      //   anchorKey: anchorKey,
      //   anchorOffset: focusOffset,// + text.length,
      //   focusKey: focusKey,
      //   focusOffset: focusOffset,// + text.length,
      //   isBackward: false,
      //   hasFocus: true,
      // })

      // externalES = EditorState.push(externalES, externalES.getCurrentContent(), "change-inline-style");
      // externalES = EditorState.acceptSelection(externalES, selection)



      externalSetEditorState(externalES)

    }

    else {

      const selection = externalES.getSelection()
      const [anchorKey, anchorOffset, focusKey, focusOffset, isBackward, hasfocus] = selection.toArray()
      const styleObj = externalES.getCurrentInlineStyle().toObject()


      const text = " "
      let newContent = Modifier.replaceText(
        externalES.getCurrentContent(),
        selection,
        text,
      )

      let newSelection = selection.merge({

        anchorKey: anchorKey,
        anchorOffset: anchorOffset,// + text.length,
        focusKey: focusKey,
        focusOffset: focusOffset + text.length,
        isBackward: false,
        hasFocus: true,
      })

      Object.keys(styleObj).forEach(item => {
        if (item === styleType) { return }
        newContent = Modifier.applyInlineStyle(newContent, newSelection, styleObj[item])
      })

      newContent = Modifier.applyInlineStyle(newContent, newSelection, styleObj[styleType] ? [] : styleType)
      externalES = EditorState.push(externalES, newContent, "insert-characters");
      externalES = EditorState.acceptSelection(externalES, newSelection)

      externalSetEditorState(externalES)

      //   console.log(endKey, endOffset)
      // console.log(Date.now(), "===")
      // externalES = RichUtils.toggleInlineStyle(externalES, styleType)
      // externalSetEditorState(externalES)

    }

  }

  function makeLarge(styleType = "LARGE") {

    const isCollapsed = externalES.getSelection().isCollapsed()

    if (!isCollapsed) {
      let selection = externalES.getSelection()
      const [anchorKey, anchorOffset, focusKey, focusOffset, isBackward, hasfocus] = selection.toArray()
      const styleObj = externalES.getCurrentInlineStyle().toObject()
      let newContent = externalES.getCurrentContent()

      console.log(styleObj)
      if (styleType === "LARGE") {
        newContent = Modifier.removeInlineStyle(newContent, selection, "SMALL")
        newContent = Modifier.removeInlineStyle(newContent, selection, "LARGE")
        if (!styleObj.LARGE) {
          newContent = Modifier.applyInlineStyle(newContent, selection, "LARGE")
        }
      }
      else if (styleType === "SMALL") {
        newContent = Modifier.removeInlineStyle(newContent, selection, "SMALL")
        newContent = Modifier.removeInlineStyle(newContent, selection, "LARGE")
        if (!styleObj.SMALL) {
          newContent = Modifier.applyInlineStyle(newContent, selection, "SMALL")
        }
      }

      //   if (Math.abs(focusOffset - anchorOffset) !== 1) {
      // selection = selection.merge({

      //   anchorKey: anchorKey,
      //   anchorOffset: focusOffset,// + text.length,
      //   focusKey: focusKey,
      //   focusOffset: focusOffset,// + text.length,
      //   isBackward: false,
      //   hasFocus: true,
      // })


      // }

      externalES = EditorState.push(externalES, newContent, "change-inline-style");
      externalES = EditorState.acceptSelection(externalES, selection)
      externalSetEditorState(externalES)



    }

    else if (isCollapsed) {
      const selection = externalES.getSelection()
      const [anchorKey, anchorOffset, focusKey, focusOffset, isBackward, hasfocus] = selection.toArray()
      const styleObj = externalES.getCurrentInlineStyle().toObject()

      const text = " "
      let newContent = Modifier.insertText(
        externalES.getCurrentContent(),
        selection,
        text,
      )

      let newSelection = selection.merge({

        anchorKey: anchorKey,
        anchorOffset: anchorOffset,// + text.length,
        focusKey: focusKey,
        focusOffset: focusOffset + text.length,
        isBackward: false,
        hasFocus: true,
      })

      Object.keys(styleObj).forEach(item => {
        if (item === styleType || item === "LARGE" || item === "SMALL") {
          return
        }
        newContent = Modifier.applyInlineStyle(newContent, newSelection, styleObj[item])
      })

      newContent = Modifier.applyInlineStyle(newContent, newSelection, styleObj[styleType] ? [] : styleType)
      externalES = EditorState.push(externalES, newContent, "insert-characters");
      externalES = EditorState.acceptSelection(externalES, newSelection)

      externalSetEditorState(externalES)
    }


  }
  function makeSmall() {
    externalES.getSelection().isCollapsed()

  }

  function LargeButton({ editor, isLargeOn, setIsLargeOn, ...props }) {
    const theme = useTheme()
    return (
      <Button {...props}
        style={{
          backgroundColor: isLargeOn ? theme.palette.primary.main : "",// theme.palette.background.default,
          color: theme.palette.type === "light"
            ? isLargeOn
              ? theme.palette.primary.contrastText
              : theme.palette.primary.main
            : isLargeOn
              ? theme.palette.primary.contrastText
              : theme.palette.text.secondary
        }}
        onClick={function (e) {

          editor.current.focus()
          makeLarge("LARGE", setIsLargeOn)
        }}
      >
        <TextFieldsOutlined />
      </Button>
    )
  }

  function SmallButton({ editor, isSmallOn, setIsSmallOn, ...props }) {
    const theme = useTheme()
    return (
      <Button {...props}
        style={{
          backgroundColor: isSmallOn ? theme.palette.primary.main : "",// theme.palette.background.default,
          color: theme.palette.type === "light"
            ? isSmallOn
              ? theme.palette.primary.contrastText
              : theme.palette.primary.main
            : isSmallOn
              ? theme.palette.primary.contrastText
              : theme.palette.text.secondary
        }}
        onClick={function (e) {

          editor.current.focus()
          makeLarge("SMALL", setIsSmallOn)
        }}
      >
        <FormatSize />
      </Button>
    )
  }

  function CenterButton({ editor, isCenterOn, setIsCenterOn, ...props }) {

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
      onClick={function (e) {

        editor.current.focus()
           makeBold("CENTER", setIsCenterOn)
      }}
    >
      <FormatAlignCenter />
    </Button>


  }

  return {


    boldPlugin: {

      onChange: function (editorState, { setEditorState }) {
        externalES = editorState
        externalSetEditorState = setEditorState
        return externalES

      },

    },


    BoldButton: function (props) { return <BoldButton makeBold={makeBold}  {...props} /> },
    ItalicButton: function (props) { return <ItalicButton makeBold={makeBold}  {...props} /> },
    UnderlineButton: function (props) { return <UnderlineButton makeBold={makeBold}  {...props} /> },
    LargeButton,
    SmallButton,
   // CenterButton,
  }
}

function BoldButton({ children, makeBold,
  isBoldOn, setIsBoldOn,

  styleType, editor, ...props }) {

  const theme = useTheme()


  return (

    <Button   {...props}

      style={{

        backgroundColor: isBoldOn ? theme.palette.primary.main : "",// theme.palette.background.default,


        color: theme.palette.type === "light"
          ? isBoldOn
            ? theme.palette.primary.contrastText
            : theme.palette.primary.main
          : isBoldOn
            ? theme.palette.primary.contrastText
            : theme.palette.text.secondary

      }}


      onClick={function (e) {
        //  setIsBoldOn(pre => !pre)

        editor.current.focus()
        // setIsBoldOn(pre => {

        //   return !pre
        // })
        //  

        makeBold("BOLD", setIsBoldOn)

      }}
    >
      <FormatBold />
      {/* {children} */}
    </Button>
  )
}

function ItalicButton({ children, makeBold,

  isItalicOn, setIsItalicOn,

  styleType, editor, ...props }) {
  const theme = useTheme()
  return (
    <Button   {...props}

      style={{

        backgroundColor: isItalicOn ? theme.palette.primary.main : "",//theme.palette.background.default,


        color: theme.palette.type === "light"
          ? isItalicOn
            ? theme.palette.primary.contrastText
            : theme.palette.primary.main
          : isItalicOn
            ? theme.palette.primary.contrastText
            : theme.palette.text.secondary

      }}


      onClick={function (e) {
        editor.current.focus()
        //  setIsItalicOn(pre => !pre)

        makeBold("ITALIC", setIsItalicOn)

      }}
    >
      <FormatItalic />
      {/* {children} */}
    </Button>

  )
}

function UnderlineButton({ children, makeBold,

  isUnderlineOn, setIsUnderlineOn,

  styleType, editor, ...props }) {
  const theme = useTheme()
  return (
    <Button   {...props}


      style={{

        backgroundColor: isUnderlineOn ? theme.palette.primary.main : "",// theme.palette.background.default,


        color: theme.palette.type === "light"
          ? isUnderlineOn
            ? theme.palette.primary.contrastText
            : theme.palette.primary.main
          : isUnderlineOn
            ? theme.palette.primary.contrastText
            : theme.palette.text.secondary

      }}


      onClick={function (e) {
        //    setIsUnderlineOn(pre => !pre)
        editor.current.focus()
        makeBold("UNDERLINE", setIsUnderlineOn)

      }}
    >
      < FormatUnderlined />
      {/* {children} */}
    </Button>

  )



}