import React, { useState, useRef, useEffect } from 'react';

import Immutable from 'immutable'
import axios from "axios"

import { Typography, Button, ButtonGroup, Container, Grid } from "@material-ui/core";
import { CropOriginal, Image, Brightness4, Brightness5, FormatBold, FormatItalic, AddPhotoAlternateOutlined } from "@material-ui/icons";
import { makeStyles, styled, useTheme } from '@material-ui/core/styles';

import {
  EditorState, ContentBlock,
  CharacterMetadata, SelectionState, convertToRaw,
  convertFromRaw, RichUtils, Modifier, convertFromHTML,
  AtomicBlockUtils, ContentState
}
  from 'draft-js';
import {
  isMobile,
  isFirefox,
  isChrome,
  browserName,
  engineName,
} from "react-device-detect";



export default function createImagePlugin() {
  let externalES = null;
  let externalSetEditorState = null;



  function insertImageBlock0(url, id, imgdata) {



    // const contentState = externalES.getCurrentContent();
    // const contentStateWithEntity = contentState.createEntity("imageBlock", 'IMMUTABLE', { url, id, imgdata });

    // const entityKey = contentStateWithEntity.getLastCreatedEntityKey();


    // externalES = EditorState.set(
    //   externalES,
    //   { currentContent: contentStateWithEntity },
    // );
    externalES = AtomicBlockUtils.insertAtomicBlock(externalES, null, 'imageBlockText')
    externalSetEditorState(externalES)

  }


  function insertImageBlock1(url, id = "", imgdata = "") {

    //   if ((picArr.length===0) && hasImageBlock()) {
    //  //   alert("aaa")
    //     removeImageBlog()
    //   }


    const selection = externalES.getSelection();

    let contentState = externalES.getCurrentContent();



    const currentBlock = contentState.getBlockForKey(selection.getEndKey());
    const blockMap = contentState.getBlockMap()



    const blocksBefore = blockMap.toSeq().takeUntil(function (v) { return v === currentBlock })
    const blocksAfter = blockMap.toSeq().skipUntil(function (v) { return v === currentBlock }).rest()


    const newBlockKey = id + genKey()

    const newBlockKey2 = id + genKey()




    let newBlocks =
      [
        [currentBlock.getKey(), currentBlock],
        [newBlockKey, new ContentBlock({
          key: newBlockKey,
          type: "imageBlock",
          text: '',
          data: Immutable.fromJS({ imgUrl: url, imgId: id, imgData: imgdata }),
        })],
        [newBlockKey2, new ContentBlock({
          key: newBlockKey2,
          type: "unstyled",
          text: '',

        })],
      ];


    const newBlockMap = blocksBefore.concat(newBlocks, blocksAfter).toOrderedMap()
    contentState = contentState.merge({
      blockMap: newBlockMap,

      selectionBefore: selection,//.merge({ hasFocus: true,}),
      selectionAfter: selection.merge({
        anchorKey: newBlockKey2,
        anchorOffset: 0,
        focusKey: newBlockKey2,
        focusOffset: 0,
        isBackward: false,
        hasFocus: true,
      }),
    })


    externalES = EditorState.push(externalES, contentState, 'insert-fragment');
    externalSetEditorState(externalES)


  };

  function insertImageBlock(editor) {


    let contentState = externalES.getCurrentContent();
    const selection = externalES.getSelection()

    const currentKey = selection.getEndKey()
    const currentBlock = contentState.getBlockForKey(selection.getEndKey());


    let newContentBlockArr = contentState.getBlocksAsArray()
    const selectionBefore = contentState.getSelectionBefore()
    const selectionAfter = contentState.getSelectionAfter()

    let currentIndex = newContentBlockArr.findIndex(item => { return item.key === currentKey })
    currentIndex = currentIndex >= 0 ? currentIndex : newContentBlockArr.length - 1
    console.log(currentIndex)

    newContentBlockArr.splice(currentIndex + 1, 0,
      new ContentBlock({
        key: genKey(),
        type: "imageBlock",
        text: '',
      })
    )

    contentState = ContentState.createFromBlockArray(newContentBlockArr)
    contentState = contentState.merge({
      selectionAfter, //newBlockMap,
      selectionBefore,
    })


    // externalES = EditorState.createWithContent(contentState)
    externalES = EditorState.push(externalES, contentState, 'insert-fragment');
    externalSetEditorState(externalES)
  }




  function removeImageBlog0() {

    const selection = externalES.getSelection();
    let contentState = externalES.getCurrentContent();
    const blockMap = contentState.getBlockMap();

    const imageBlog = contentState.getBlocksAsArray().find(item => { return item.type === "imageBlock" || item.type === "atomic" })
    const blockNum = contentState.getBlocksAsArray().length


    if (Boolean(imageBlog) && (blockNum === 1)) {
      let externalES_ = EditorState.createEmpty()
      contentState = externalES_.getCurrentContent()
      externalES = EditorState.push(externalES_, contentState, 'insert-fragment');
      setTimeout(() => {
        externalSetEditorState(externalES_)
      }, 0);
      return null
    }

    if (imageBlog) {
      const atomicBlock = imageBlog

      contentState = Modifier.removeRange(
        contentState,
        new SelectionState({
          anchorKey: atomicBlock.getKey(),
          anchorOffset: 0,
          focusKey: atomicBlock.getKey(),
          focusOffset: atomicBlock.getLength(),
        }),
        'backward',
      );

      const blockMap = contentState.getBlockMap().delete(atomicBlock.getKey());
      contentState = contentState.merge({
        blockMap,
        // selectionAfter: selection,
      });


      externalES = EditorState.push(externalES, contentState, 'remove-range');
      externalSetEditorState(externalES)

    }


  }

  function removeImageBlog1() {

    const selection = externalES.getSelection();
    let contentState = externalES.getCurrentContent();
    const blockMap = contentState.getBlockMap();

    const imageBlog = contentState.getBlocksAsArray().find(item => { return item.type === "imageBlock" || item.type === "atomic" })
    const blockNum = contentState.getBlocksAsArray().length


    if (Boolean(imageBlog) && (blockNum === 1)) {
      let externalES_ = EditorState.createEmpty()
      contentState = externalES_.getCurrentContent()
      externalES = EditorState.push(externalES_, contentState, 'insert-fragment');
      setTimeout(() => {
        externalSetEditorState(externalES_)
      }, 0);
      return null
    }

    else if (imageBlog) {

      const imageBlogKey = imageBlog.getKey()
      const blocksBefore = blockMap.toSeq().takeUntil(function (v) { return v.getKey() === imageBlogKey })
      const blocksAfter = blockMap.toSeq().skipUntil(function (v) { return v.getKey() === imageBlogKey }).rest()

      // console.log(imageBlogKey, blocksBefore.count(), blocksAfter.count())


      //  console.log(blocksBefore.toOrderedMap().toArray().pop().getText())

      const newBlockMap = Boolean(blocksBefore)
        ? Boolean(blocksAfter) ? blocksBefore.concat(blocksAfter).toOrderedMap() : blocksBefore.toOrderedMap()
        : Boolean(blocksAfter) ? blocksAfter.toOrderedMap() : null

      const key = (blocksBefore && blocksBefore.toOrderedMap().toArray().pop().getKey())
        || (blocksAfter && blocksAfter.toOrderedMap().toArray().pop().getKey())

      const key1 = (blocksBefore && blocksBefore.toOrderedMap().toArray().pop().getKey())
      const key2 = (blocksAfter && blocksAfter.toOrderedMap().toArray().pop().getKey())
      console.log(key1, key2)



      //  const key ="1111"
      contentState = contentState.merge({
        blockMap: newBlockMap,

        // selectionBefore: SelectionState.createEmpty().merge({
        //   anchorKey: key,
        //   focusKey: key,
        //   anchorOffset: 0,
        //   focusOffset: 0,
        //   isBackward: false,
        //   hasFocus: false,
        // }),
        // selectionBefore: SelectionState.createEmpty().merge({
        //   anchorKey: key,
        //   focusKey: key,
        //   anchorOffset: 0,
        //   focusOffset: 0,
        //   isBackward: false,
        //   hasFocus: false,
        // }),



      })
      externalES = EditorState.push(externalES, contentState, 'insert-fragment');
      //   setTimeout(() => {
      externalSetEditorState(externalES)
      //   }, 0)

      return externalES
    }


  }

  function removeImageBlog() {

    let contentState = externalES.getCurrentContent();
    const selectionBefore = contentState.getSelectionBefore()
    const selectionAfter = contentState.getSelectionAfter()


    let imageBlog = contentState.getBlocksAsArray().find(item => { return item.type === "imageBlock" || item.type === "atomic" })


    let newContentBlockArr = contentState.getBlocksAsArray().filter(function (item) {


      return !((item.type === "imageBlock" || item.type === "atomic"))

    })


    const imageBLogKey = imageBlog && imageBlog.getKey()

    if (!imageBLogKey) { return }
    if ((imageBLogKey) && (contentState.getBlocksAsArray().length <= 1)) {
      externalES = EditorState.createEmpty()
      setTimeout(() => {
        externalSetEditorState(externalES)
      }, 0);
      return null
    }

    imageBlog = contentState.getBlockForKey(imageBLogKey);
    contentState = ContentState.createFromBlockArray(newContentBlockArr)
    contentState = contentState.merge({
      selectionAfter, //newBlockMap,
      selectionBefore,
    })


    externalES = EditorState.createWithContent(contentState)

    //externalES = EditorState.push(externalES, contentState, 'insert-fragment');
    externalSetEditorState(externalES)

  }


  function hasImageBlock() {
    const selection = externalES.getSelection();

    let contentState = externalES.getCurrentContent();
    const currentBlock = contentState.getBlockForKey(selection.getEndKey());
    const blockMap = contentState.getBlockMap()
    return blockMap.toArray().findIndex((item) => {

      const result = (item.type === "atomic" && item.text === "imageBlockText") || item.type === "imageBlock"
      return result
    }) >= 0


  }

  function topImage(editor) {


    const selection = externalES.getSelection();


    let contentState = externalES.getCurrentContent();
    const selectionBefore = contentState.getSelectionBefore()
    const selectionAfter = contentState.getSelectionAfter()


    let imageBlog = contentState.getBlocksAsArray().find(item => { return item.type === "imageBlock" || item.type === "atomic" })


    let newContentBlockArr = contentState.getBlocksAsArray().sort(function (itemA, itemB) {
      if (itemA.type === "imageBlock" || itemA.type === "atomic") {
        return -1
      }
      else {
        return 0
      }
    })


    const imageBLogKey = imageBlog && imageBlog.getKey()

    if (!imageBLogKey) { return }

    imageBlog = contentState.getBlockForKey(imageBLogKey);

    console.log(contentState.getBlocksAsArray().length)

    contentState = ContentState.createFromBlockArray(newContentBlockArr)
    contentState = contentState.merge({
      selectionAfter, //newBlockMap,
      selectionBefore,
    })


    // externalES = EditorState.createWithContent(contentState)

    externalES = EditorState.push(externalES, contentState, 'insert-fragment');
    externalSetEditorState(externalES)










  }


  function ImageBlog({ block, editor, contentState, picArr, setPicArr, ...props }) {
    //   const text = block.getText()
    //   let { imgArr, imgUrl } = block.getData().toObject()
    //  const type = block.getType()
    const theme = useTheme()

    const picNum = picArr.length
    const imgArr = picArr


    if (picNum === 0) {

      //  setTimeout(() => {
      //    removeImageBlog()
      //  }, 0);

      return (
        <div style={{
          // display:"none",
          position: "relative",
          width: "100%",
          height: 0,
          paddingBottom: "56.25%",

          // backgroundRepeat: "no-repeat",
          // backgroundPositionX: "center",
          // backgroundPositionY: "center",
          // backgroundSize: "cover",
          // backgroundImage: "url(" + imgArr[0] + ")",

          backgroundColor: theme.palette.divider,   //"skyblue",
          overflow: "hidden",

        }}

        >
          <button
            onClick={function () {
              //  alert("xx")
              //removeImageBlog()
              //setPicArr([])

            }}
          >delete</button>
          {/* <AddPhotoAlternateOutlined style={{ transform: "translateX(59%)" }} /> */}
          {/* <ImageButton color="primary" fontSize="small" picArr={picArr} setPicArr={setPicArr} editor={editor} /> */}
        </div>


      )
    }
    else if (picNum === 1) {
      return <div style={{

        position: "relative",
        width: "100%",
        height: 0,
        paddingBottom: "56.25%",

        backgroundRepeat: "no-repeat",
        backgroundPositionX: "center",
        backgroundPositionY: "center",
        backgroundSize: "cover",
        backgroundImage: "url(" + imgArr[0].localUrl + ")",

        backgroundColor: theme.palette.divider,   //"skyblue",
        overflow: "hidden"
      }}

        onClick={function () {

          setPicArr(pre => {
            setTimeout(() => { removeImageBlog() }, 0);
            return []
          })

        }}

      />

    }
    else if (picNum === 2) {
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
            backgroundImage: "url(" + imgArr[0].localUrl + ")",
            transform: "translateX(-1px) translateY(0px)",
            backgroundColor: "wheat",
          }}
            onClick={function () {
              setPicArr(pre => [pre[1]])
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
            backgroundImage: "url(" + imgArr[1].localUrl + ")",
            transform: "translateX(1px) translateY(0px)",
            backgroundColor: "wheat",
          }}
            onClick={function () {
              setPicArr(pre => [pre[0]])
            }}
          />

        </div>
      )
    }


    else if (picNum === 3) {
      return (
        <div style={{
          position: "relative",
          width: "100%",
          height: 0,
          paddingBottom: "56.25%",
          backgroundPositionX: "center",
          backgroundPositionY: "center",
          backgroundColor: theme.palette.divider,   //"skyblue",
          overflow: "hidden"
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
            backgroundImage: "url(" + imgArr[0].localUrl + ")",
            transform: "translateX(-1px) translateY(0px)",
            backgroundColor: "wheat",
          }}
            onClick={function () {
              setPicArr(pre => [pre[1], pre[2]])
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
            backgroundImage: "url(" + imgArr[1].localUrl + ")",
            transform: "translateX(1px) translateY(-1px)",


          }} onClick={
            function () {
              setPicArr(pre => [pre[0], pre[2]])
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
            backgroundImage: "url(" + imgArr[2].localUrl + ")",
            transform: "translateX(1px) translateY(1px)",

          }} onClick={
            function () {
              setPicArr(pre => [pre[0], pre[1]])
            }} />

        </div>
      )
    }


    else {
      return (
        <div style={{
          position: "relative",
          width: "100%",
          height: 0,
          paddingBottom: "56.25%",
          backgroundPositionX: "center",
          backgroundPositionY: "center",
          backgroundColor: theme.palette.divider,   //"skyblue",
          overflow: "hidden"
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
            backgroundImage: "url(" + imgArr[0].localUrl + ")",
            transform: "translateX(-1px) translateY(-1px)",

          }} onClick={function () {
            setPicArr(pre => [pre[1], pre[2], pre[3]])
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
            backgroundImage: "url(" + imgArr[1].localUrl + ")",
            transform: "translateX(1px) translateY(-1px)",

          }} onClick={function () {
            setPicArr(pre => [pre[0], pre[2], pre[3]])
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
            backgroundImage: "url(" + imgArr[2].localUrl + ")",
            transform: "translateX(-1px) translateY(1px)",
          }}
            onClick={
              function () {
                setPicArr(pre => [pre[0], pre[1], pre[3]])
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
            backgroundImage: "url(" + imgArr[3].localUrl + ")",
            transform: "translateX(1px) translateY(1px)",

          }} onClick={
            function () {
              setPicArr(pre => [pre[1], pre[2], pre[3]])
            }} />


        </div>





      )
    }









    return (
      <div style={{
        position: "relative",
        width: "100%",
        height: 0,
        paddingBottom: "56.25%",

        backgroundColor: theme.palette.divider,   //"skyblue",
        overflow: "hidden"
      }}>

        <div style={{
          position: "absolute",
          width: "50%",
          height: "100%",
          // paddingBottom: "112.5%",
          backgroundColor: "pink",

          backgroundRepeat: "no-repeat",
          backgroundPositionX: "center",
          backgroundPositionY: "center",
          backgroundSize: "cover",
          backgroundImage: "url(" + imgArr[0] + ")",
          transform: "translateX(-1px)",
        }} />




        <div style={{
          position: "absolute",
          width: "50%",
          height: "50%",
          //  paddingBottom: "25%",//  "112.5%", 
          backgroundColor: "wheat",
          left: "50%",
          top: "0%",
          backgroundRepeat: "no-repeat",
          overflow: "hidden",
          backgroundPositionX: "center",
          backgroundPositionY: "center",
          backgroundSize: "cover",
          backgroundImage: "url(" + imgArr[1] + ")",
          transform: "translateX(1px) translateY(-1px)",
          backgroundColor: "wheat",
        }} />


        <div style={{
          position: "absolute",
          width: "50%",
          height: "50%",
          //  paddingBottom: "25%",//  "112.5%", 
          backgroundColor: "wheat",
          left: "50%",
          top: "50%",
          backgroundRepeat: "no-repeat",
          overflow: "hidden",
          backgroundPositionX: "center",
          backgroundPositionY: "center",
          backgroundSize: "cover",
          backgroundImage: "url(" + imgArr[2] + ")",
          transform: "translateX(1px) translateY(1px)",
          backgroundColor: "wheat",
        }} />


      </div>
    )





    return (
      <>

        <Grid container
          direction="row"
          justify="space-around"
          alignItems="flex-start"
          spacing={0}

          style={{
            backgroundColor: "skyblue",
            overflow: "hidden",
            //  minHeight: "20vh",
            //  maxHeight: "40vh",
            // height:"30vh",
          }}
        >

          {imgArr.map((item, index) => {

            let col = 12
            const picNum = imgArr.length
            const picIndex = index + 1

            //  if (picNum===1) 

            return <Grid item xs={12} sm={12} md={4} lg={4} xl={4} key={index}
              style={{
                overflow: "hidden",
                margin: 0, padding: 0, backgroundColor: index % 2 === 1 ? "pink" : "wheat",

              }}
            >
              {isChrome
                ? <img src={item} style={{ width: "100%", display: "block", aspectRatio: "16 / 9", objectFit: "cover" }} />
                : <div src={item}
                  style={{

                    position: "relative",
                    width: "100%",
                    paddingBottom: "56.25%",
                    height: 0,
                    //   height:"100%",
                    // overflow: "visible",
                    // aspectRatio: "16 / 9",
                    display: "block",

                    // objectFit: "cover",
                    //  objectFit:"contain",
                    backgroundColor: index % 2 === 1 ? "pink" : "wheat",
                  }}
                >
                  <img src={item} style={{ position: "absolute", display: "block", top: 0, left: 0, width: "100%", objectFit: "cover" }} />




                </div>}
            </Grid>

          })}

        </Grid>






        {/* {imgUrl && <img src={imgUrl}
          style={{
            maxWidth: "100%",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto"
          }}
        />} */}


      </>
    )

    return (
      <Grid container
        direction="row"
        justify="space-around"
        alignItems="flex-start"
        spacing={0}>
        <Grid item xs={12} sm={12} md={10} lg={8} xl={8} >

        </Grid>
      </Grid>
    )
  }


  function ImageButton({ children, picArr, setPicArr, editor, ...props }) {


    const inputRef = useRef()
    const theme = useTheme()


    return (
      <>

        <Button
          {...props}

          style={{
            color: theme.palette.type === "dark"

              ? picArr.length >= 4 && hasImageBlock() ? theme.palette.action.disabled : theme.palette.text.secondary
              : picArr.length >= 4 && hasImageBlock() ? theme.palette.action.disabled : theme.palette.primary.main

          }}
          disabled={picArr.length >= 4 && hasImageBlock()}
          onClick={function (e) {
            //insertImageBlock("https://picsum.photos/332")

            //   if ((picArr.length===0) && hasImageBlock()) {
            //  //   alert("aaa")
            //     removeImageBlog()
            //   }

            // if (picArr.length > 0 && !hasImageBlock()) {
            //   insertImageBlock("")
            // }
            // else {
            inputRef.current.click()
            //}



          }}
        >
          <AddPhotoAlternateOutlined />
          {/* {children} */}
        </Button>

        <input ref={inputRef} type="file" style={{ display: "none" }}
          onClick={function (e) { e.currentTarget.value = null; }}
          onChange={function (e) {
            if (e.currentTarget.files[0].name.trim().match(/\.(gif|jpe?g|tiff|png|webp|bmp)$/i)) {


              //  if (picArr.length >= 4) { return };
              const file = e.currentTarget.files[0]
              file.localUrl = URL.createObjectURL(e.currentTarget.files[0])
              //     const obj = URL.createObjectURL(e.currentTarget.files[0])
              console.log(e.currentTarget.files[0])
              setPicArr(pre => {

                // pre.push(obj);
                return [...pre, file]
              })




              if (!hasImageBlock()) { insertImageBlock(URL.createObjectURL(e.currentTarget.files[0])) }
              else {

                editor.current.focus()




              }
            }
          }}



        />
      </>
    )


  }

  function TopImageButton({ editor, ...props }) {

    const theme = useTheme()
    return (

      <Button {...props}

        style={{

          color: theme.palette.type === "light"
            ? theme.palette.primary.main
            : theme.palette.text.secondary
        }}
        onClick={function () {
          //      deleteBlock(editor)
          topImage(editor)
        }}

      >
        <Image />
      </Button>

    )
  }



  return {

    ImageBlog,

    ImageButton,
    TopImageButton,
    removeImageBlog,
    hasImageBlock,

    imagePlugin: {

      onChange: function (editorState, { setEditorState }) {

        externalES = editorState
        externalSetEditorState = setEditorState

        return externalES
      },
    },
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