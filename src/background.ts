chrome.runtime.onInstalled.addListener(() => {
  chrome.action.disable();
});


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.match(/^https:\/\/sam\.gov\/opp\/.*/)) {
      chrome.action.enable(tabId);
    } else {
      /* disable if not sam.gov */
      chrome.action.disable(tabId);
    }
  }
});
