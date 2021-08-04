import React, { useState, useRef, useEffect } from 'react';



import { EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, AtomicBlockUtils } from 'draft-js';
import Editor from "draft-js-plugins-editor";
import Immutable from 'immutable';


import { Typography, Button, ButtonGroup, Container, Link, Box } from "@material-ui/core";
import { CropOriginal, Image, Brightness4, Brightness5, FormatBold, FormatItalic, Link as LinkIcon } from "@material-ui/icons";
import { makeStyles, styled, useTheme } from '@material-ui/core/styles';



export default function createLlinkPlugin() {


  let externalES = null;
  let externalSetEditorState = null;

  function LinkComponent(props) {

    const theme = useTheme()
    const { contentState, entityKey, blockKey, offsetKey, start, end, decoratedText } = props;
    const { linkType, linkAddress, linkHost } = contentState.getEntity(entityKey).getData()

    if (linkType === "linkOn") {
      return (
        // <span href={linkAddress} style={{ backgroundColor: "#FAF", fontSize: Math.max(fontSize2 * 0.7, 0.7) + "rem" }}>
        //   {props.children}
        // </span>
        // <Box component="span" color={theme.palette.primary.light}>{props.children}</Box>
        <Link>{props.children}</Link>
      )
    }
    else if (linkType === "linkOff") {

      return (
        // <Box component="span" color={theme.palette.primary.light}>{props.children}</Box>
        <Link>{props.children}</Link>
      )

      return (
        <Box component="span" color={theme.palette.primary.light}>
          {/* <Box component="span" color={theme.palette.primary.light} style={{ display: "none" }}>{props.children}</Box> */}
          <Box component="span" color={theme.palette.primary.light} > {props.children}</Box>
          {/* {linkHost} */}
        </Box>
      )
    }
  }

  function linkStrategy(contentBlock, callback, contentState) {

    contentBlock.findEntityRanges(
      function (character) {
        const entityKey = character.getEntity();
        return (
          entityKey !== null && (
            contentState.getEntity(entityKey).getType() === "linkOn" ||
            contentState.getEntity(entityKey).getType() === "linkOff"
          )
        );
      },
      callback
    );
  }

  function taggingLink() {

    const [anchorKey, anchorOffset, focusKey, focusOffset, isBackward, hasfocus] = externalES.getSelection().toArray();
    const [anchorStartKey, anchorStartOffset, anchorFocusKey, anchorFocusOffset, isAnchorBackward, isAnchorFocused]
      = [!isBackward ? anchorKey : focusKey, !isBackward ? anchorOffset : focusOffset, isBackward ? anchorKey : focusKey, isBackward ? anchorOffset : focusOffset,];


    const oldSelection = externalES.getSelection();
    let newContent = externalES.getCurrentContent();
    let newSelection = externalES.getSelection();



    externalES.getCurrentContent().getBlocksAsArray().forEach(function (block) {
      const blockKey = block.getKey();
      const blockType = block.getType();
      const blockText = block.getText();


      const regx = /\s([a-zA-Z]{1,10}:\/\/)(([a-zA-Z0-9-_]+\.?)+(:\d{0,6})?)(\/[^\s\r\n\/]+){0,7}(\/)?/g

      const metaArr = block.getCharacterList();
      metaArr.forEach(function (item, index) {

        if (item.getEntity()) {
          const entityType = newContent.getEntity(item.getEntity()).getType()

          if ((entityType === "linkOn") || (entityType === "linkOff")) {
            newSelection = externalES.getSelection().merge({
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
        if (item.getStyle()) {
          const styleArr = item.getStyle().toArray()
          if (styleArr.includes("linkStyle")) {
            newSelection = externalES.getSelection().merge({
              anchorKey: blockKey,
              anchorOffset: index,
              focusKey: blockKey,
              focusOffset: index + 1,
              isBackward: false,
              hasFocus: false,
            })
          //  newContent = Modifier.removeInlineStyle(newContent, newSelection, "linkStyle")
          }
        }
      })

      let matchArr;
      while ((matchArr = regx.exec(blockText)) !== null) {

        const start = matchArr.index;
        const end = matchArr.index + matchArr[0].length
        const contentLenth = end - start;
        const contentFocusAt = anchorFocusOffset - start;
        const linkAddress = blockText.substring(start, end);
        const linkHost = " " + matchArr[2];

      

        const linkOn = hasfocus && (blockKey === anchorFocusKey) && (contentFocusAt > 0) && (contentFocusAt <= contentLenth)
        const linkOff = ((!hasfocus) || (blockKey !== anchorFocusKey) || (contentFocusAt <= 0) || (contentFocusAt - contentLenth > 0))




        if (linkOn) {
          newContent = newContent.createEntity("linkOn", "MUTABLE", { linkType: "linkOn", linkAddress, linkHost });
          const entityKey = newContent.getLastCreatedEntityKey();
          newSelection = externalES.getSelection().merge({
            anchorKey: blockKey,
            anchorOffset: start+1,   //[...blockText][start] === " " ? start + 1 : start,
            focusKey: blockKey,
            focusOffset: end,
            isBackward: false,
            hasFocus: false,
          })
          newContent = Modifier.applyEntity(newContent, newSelection, entityKey)
        }
        else if (linkOff) {
          newContent = newContent.createEntity("linkOff", "MUTABLE", { linkType: "linkOff", linkAddress, linkHost });
          const entityKey = newContent.getLastCreatedEntityKey();
          newSelection = externalES.getSelection().merge({
            anchorKey: blockKey,
            anchorOffset: start+1,   //[...blockText][start] === " " ? start + 1 : start,
            focusKey: blockKey,
            focusOffset: end,
            isBackward: false,
            hasFocus: false,
          })
          newContent = Modifier.applyEntity(newContent, newSelection, entityKey)
          // newContent = Modifier.applyInlineStyle(newContent, newSelection, "linkStyle")




        }





      }
    });

    externalES = EditorState.push(externalES, newContent, "insert-fragment");
    externalES = EditorState.acceptSelection(externalES, oldSelection);
    return externalES;





  };




  return {

    linkPlugin: {
      onChange(editorState, { setEditorState }) {
        externalES = editorState
        externalSetEditorState = setEditorState
        externalES = taggingLink();
        return externalES
      },

      decorators: [
        {
          strategy: linkStrategy,
          component: LinkComponent
        }
      ],
    }

  }


}