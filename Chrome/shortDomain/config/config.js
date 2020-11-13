let data = {
  index: undefined,
  shortName: '',
  domain: '',
  shortDomainList: [],
  formShow: false,
  title: ''
};

const setNewShortDomainList = (callback) => {
  chrome.storage.sync.get('extensionShortDomain', (storeData) => {
    data.shortDomainList = storeData.extensionShortDomain || [];
    callback && callback();
  });
};

const shortNameInput = document.querySelector('#shortName');
const domainInput = document.querySelector('#domain');
const btnAdd = document.querySelector('.btn-add');
const btnSubmit = document.querySelector('.form-actions--submit');
const btnCancel = document.querySelector('.form-actions--cancel');
const clearBtn = document.querySelector('.clearList');
const table = document.querySelector('.short-domain-existed__table');
const formTitle = document.querySelector('.form-title');

const formWrapper = document.querySelector('.form-wrapper');

const dispatchDataChange = (newData, callback) => {
  if (newData) {
    data = {
      ...newData
    };
  }

  shortNameInput.value = data.shortName;
  domainInput.value = data.domain;
  
  const {
    shortName, domain, title, shortDomainList, formShow
  } = data;

  if (!shortName || !domain) {
    btnSubmit.setAttribute('disabled', true);
  } else {
    btnSubmit.removeAttribute('disabled');
  }

  if (!shortDomainList.length) {
    const nodataStr = `
      <thead>
        <th>序号</th>
        <th>短域名</th>
        <th>url</th>
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
        <th>url</th>
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
            <button class="primary edit-action" data-item='${JSON.stringify({ ...item, index })}' >修改</button>
            <button class="danger delete-action" data-item='${JSON.stringify(item)}' >删除</button>
          </td>
        </tr>
      `;
    });
    table.innerHTML = innerhtml;

    clearBtn.removeAttribute('disabled');
  }

  if (formShow) {
    formWrapper.style.display = 'flex';
    parseInt(formWrapper.offsetTop);
    formWrapper.classList.add('show');
  } else {
    formWrapper.classList.remove('show');
    setTimeout(() => {
      formWrapper.style.display = 'none';
    }, 200);
  }

  if (title) {
    formTitle.innerHTML = title;
  }

  callback && callback();
};

setNewShortDomainList(dispatchDataChange);

const alertCustom = (props) => {
  const { timeout = 2000, type = 'success', msg } = props;
  const msgDom = `
    <div>
      ${msg}
    </div>
  `;
  const typeMap = {
    success: '#87d068',
    warnning: 'orange',
    error: 'red'
  };
  const div = document.createElement('div');

  div.innerHTML = msgDom;
  div.style.background = typeMap[type];
  div.classList.add('alert-msg');
  document.body.appendChild(div);

  parseInt(formWrapper.offsetTop);
  div.style.opacity = 1;
  
  setTimeout(() => {
    div.style.opacity = 0;
    
    setTimeout(() => {
      document.body.removeChild(div);
    }, 200);
  }, timeout);
};

btnAdd.addEventListener('click', () => {
  dispatchDataChange({
    ...data,
    formShow: true,
    title: '添加'
  });
});

shortNameInput.addEventListener('input', (e) => {
  const shortName = e.target.value;
  dispatchDataChange({
    ...data,
    shortName,
  });
});
domain.addEventListener('input', (e) => {
  const domain = e.target.value;
  dispatchDataChange({
    ...data,
    domain
  });
});
btnSubmit.addEventListener('click', () => {
  setNewShortDomainList(() => {
    const shortNameExist = data.shortDomainList.some(item => {
      return item.shortName === data.shortName && data.index === undefined;
    });
  
    if (shortNameExist) {
      alertCustom({
        msg: '短域名已占用！'
      });
    } else if (!/(\w+):\/\/([^/:]+)(:\d*)?/.test(data.domain)) {
      alertCustom({
        msg: '请输入正确的url，"协议://域名:端口号（可选）"'
      });
    } else {
      const { index, shortDomainList, shortName, domain } = data;
      const newList = [...shortDomainList];
      const newItem = {
        shortName: shortName,
        domain: domain
      };

      if (index === undefined) {
        newList.push(newItem);
      } else {
        newList.splice(index, 1, newItem);
      }

      chrome.storage.sync.set({
        extensionShortDomain: newList
      }, () => {
        alertCustom({
          msg: '设置成功！'
        });
        setNewShortDomainList(() => {
          dispatchDataChange(null, () => {
            handleCancel();
          });
        });
      });
    }
  });
});

const handleCancel = () => {
  dispatchDataChange({
    ...data,
    index: undefined,
    shortName: '',
    domain: '',
    formShow: false,
    title: ''
  });
}
btnCancel.addEventListener('click', () => {
  handleCancel();
});

clearBtn.addEventListener('click', () => {
  const result = window.confirm("确认清除？");

  if (result) {
    chrome.storage.sync.set({
      extensionShortDomain: []
    }, () => {
      dispatchDataChange({
        ...data,
        shortDomainList: []
      });
      alertCustom({
        msg: '清除成功！',
      });
    });
  }
});

table.addEventListener('click', (e) => {
  const target = e.target;
  const classList = target.classList;

  if (target && target.nodeName && target.nodeName.toUpperCase() === 'BUTTON' && classList) {
    const recordStr = target.dataset.item;

    if (!recordStr) {
      return;
    }

    const record = JSON.parse(target.dataset.item);

    if (Array.prototype.indexOf.call(classList, 'delete-action') > -1) {
      const newList = data.shortDomainList.filter(item => item.shortName !== record.shortName);
      const result = window.confirm('确认删除？');

      if (result) {
        chrome.storage.sync.set({
          extensionShortDomain: [...newList]
        }, () => {
          alertCustom({
            msg: '删除成功！'
          });
          setNewShortDomainList(dispatchDataChange);
        });
      }
    } else if (Array.prototype.indexOf.call(classList, 'edit-action') > -1) {
      dispatchDataChange({
        ...data,
        ...record,
        formShow: true
      });
    }
  }
});
