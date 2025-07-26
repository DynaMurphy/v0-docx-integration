/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

const Office = require("office-js")
const Word = Office.Word
const OfficeExtension = require("office-js-helpers")

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    document.getElementById("insert-comment").onclick = insertComment
    document.getElementById("send-message").onclick = sendMessageToHost
  }
})

function insertComment() {
  Word.run(async (context) => {
    const range = context.document.getSelection()
    range.insertComment("This is a comment from the add-in!")
    await context.sync()
  }).catch((error) => {
    console.log("Error: " + error)
    if (error instanceof OfficeExtension.Error) {
      console.log("Debug info: " + JSON.stringify(error.debugInfo))
    }
  })
}

function sendMessageToHost() {
  // Send a message to the parent window (our Next.js editor page)
  // In production, specify the target origin for security.
  parent.postMessage(
    {
      type: "ADDIN_MESSAGE",
      payload: {
        command: "USER_ACTION",
        data: {
          action: "Button Clicked",
          timestamp: new Date().toISOString(),
        },
      },
    },
    "*",
  )
}
