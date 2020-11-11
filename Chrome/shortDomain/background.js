chrome.browserAction.onClicked.addListener(function(){
  var newURL = "./config/configPage.html";
  chrome.tabs.create({ url: newURL });
});

chrome.omnibox.onInputEntered.addListener((...rest) => {
  chrome.storage.sync.get('extensionShortDomain', (storeData) => {
    const shortDomainList = storeData.extensionShortDomain || [];
    const shortName = rest[0];
    const item = shortDomainList.filter(item => item.shortName === shortName)[0];
    const domain = item ? item.domain : undefined;
    
    if (domain) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.update({
          url: domain
        });
      });
    }
  });
});
