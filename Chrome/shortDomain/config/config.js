let data = {
  shortName: '',
  domain: '',
  shortDomainList: []
};

const setNewShortDomainList = (callback) => {
  chrome.storage.sync.get('extensionShortDomain', (storeData) => {
    data.shortDomainList = storeData.extensionShortDomain || [];
    callback && callback();
  });
};

const shortNameInput = document.querySelector('#shortName');
const domainInput = document.querySelector('#domain');
const btnSubmit = document.querySelector('.form-actions--add');
const clearBtn = document.querySelector('.clearList');
const table = document.querySelector('.short-domain-existed__table');

const dispatchDataChange = (key, value) => {
  if (key) {
    data[key] = value;
  }

  shortNameInput.setAttribute('value', data.shortName);
  domainInput.setAttribute('value', data.domain);
  
  if (!data.shortName || !data.domain) {
    btnSubmit.setAttribute('disabled', true);
  } else {
    btnSubmit.removeAttribute('disabled');
  }

  if (!data.shortDomainList.length) {
    const nodataStr = `
      <thead>
        <th>序号</th>
        <th>短域名</th>
        <th>域</th>
        <th>操作</th>
      </thead>
      <tr>
        <td colspan="4" >暂无设置</td>
      </tr>
    `;

    table.innerHTML = nodataStr;
    clearBtn.setAttribute('disabled', true);
  } else {
    const shortDomainList = data.shortDomainList;
    let innerhtml = `
      <thead>
        <th>序号</th>
        <th>短域名</th>
        <th>域</th>
        <th>操作</th>
      </thead>
    `;

    shortDomainList.forEach((item, index) => {
      innerhtml += `
        <tr>
          <td>${index + 1}</td>
          <td>${item.shortName}</td>
          <td>${item.domain}</td>
          <td>
            <button class="danger delete-action" data-item='${JSON.stringify(item)}' >删除</button>
          </td>
        </tr>
      `;
    });
    table.innerHTML = innerhtml;

    clearBtn.removeAttribute('disabled');
  }
};

setNewShortDomainList(dispatchDataChange);

shortNameInput.addEventListener('input', (e) => {
  const shortName = e.target.value;
  dispatchDataChange('shortName', shortName);
});
domain.addEventListener('input', (e) => {
  const domain = e.target.value;
  dispatchDataChange('domain', domain);
});
btnSubmit.addEventListener('click', () => {
  setNewShortDomainList(() => {
    const shortNameExist = data.shortDomainList.some(item => {
      return item.shortName === data.shortName;
    });
  
    if (shortNameExist) {
      alert('短域名已占用！');
    } else {
      chrome.storage.sync.set({
        extensionShortDomain: [
          ...data.shortDomainList,
          {
            shortName: data.shortName,
            domain: data.domain
          }
        ]
      }, () => {
        alert('设置成功！');
        setNewShortDomainList(dispatchDataChange);
      });
    }
  });
});

clearBtn.addEventListener('click', () => {
  chrome.storage.sync.set({
    extensionShortDomain: []
  }, () => {
    dispatchDataChange('shortDomainList', []);
    alert('清除成功！');
  });
});

table.addEventListener('click', (e) => {
  const target = e.target;
  const classList = target.classList;

  if (target && target.nodeName && target.nodeName.toUpperCase() === 'BUTTON' && classList && Array.prototype.indexOf.call(classList, 'delete-action') > -1) {
    const recordStr = target.dataset.item;

    if (recordStr) {
      const record = JSON.parse(target.dataset.item);
      const newList = data.shortDomainList.filter(item => item.shortName !== record.shortName);
  
      chrome.storage.sync.set({
        extensionShortDomain: [...newList]
      }, () => {
        alert('删除成功！');
        setNewShortDomainList(dispatchDataChange);
      });
    }
  }
});
