let btnChangeColor = document.querySelector('#changeColor');

chrome.storage.sync.get('color', (data) => {
  btnChangeColor.setAttribute('value', data.color);
});

const setCode = (color) => {
  return `
    const styleNode = document.createElement('style');
    styleNode.innerHTML = \`
      body, body * {
        background: ${color}!important;
      }
    \`;
    document.body.style.backgroundColor = "${color}";
    document.head.appendChild(styleNode);
  `;
};

btnChangeColor.onclick = function(element) {
  let color = element.target.value;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      {code: setCode(color)}
    );
  });
};
