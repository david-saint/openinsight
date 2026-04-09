import { mountContentApp } from "./mount.js";

console.log("OpenInsight content script initialized.");

let isCaptureActive = false;

export function getCaptureState() {
  return isCaptureActive;
}

export function setCaptureState(active: boolean) {
  isCaptureActive = active;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "ACTIVATE_CAPTURE") {
    isCaptureActive = true;
    document.dispatchEvent(new CustomEvent("openinsight:capture-activated"));
    sendResponse({ success: true });
  }
});

mountContentApp();
