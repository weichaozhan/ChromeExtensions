const root = document.querySelector('#config-container');

class App extends Component {
  constructor(props = {}) {
    super(props);
    this.state = {
      index: undefined,
      shortName: '',
      domain: '',
      shortDomainList: [],
      formShow: false,
      title: ''
    };
    this.getExtensionShortDomain();
  }

  getExtensionShortDomain(callback) {
    chrome.storage.sync.get('extensionShortDomain', (storeData) => {
      const shortDomainList = storeData.extensionShortDomain || [];
      this.setState({
        shortDomainList: shortDomainList
      });
      callback && callback();
    });
  }

  openForm(index = undefined, dataEdit = {}) {
    this.setState({
      index: index,
      shortName: index === undefined ? '' : dataEdit.shortName,
      domain: index === undefined ? '' : dataEdit.domain,
      formShow: true,
      title: index === undefined ? '添加' : '修改',
    });
  }

  closeForm() {
    this.setState({
      index: undefined,
      shortName: '',
      domain: '',
      formShow: false,
      title: ''
    });
  }

  clearAll() {
    const result = window.confirm("确认清除？");

    if (result) {
      chrome.storage.sync.set({
        extensionShortDomain: []
      }, () => {
        this.setState({
          index: undefined,
          shortName: '',
          domain: '',
          shortDomainList: [],
          formShow: false,
          title: ''
        });
        alertCustom({
          msg: '清除成功！',
        });
      });
    }
  }

  submitForm(values) {
    const { shortName, domain } = values;
    const { index, shortDomainList } = this.state;
    const shortNameExist = shortDomainList.some(item => {
      return item.shortName === values.shortName && index === undefined;
    });
  
    if (shortNameExist) {
      alertCustom({
        msg: '短域名已占用！',
        type: 'error'
      });
    } else if (!/(\w+):\/\/([^/:]+)(:\d*)?/.test(values.domain)) {
      alertCustom({
        msg: '请输入正确的url，"协议://域名:端口号（可选）"',
        type: 'error'
      });
    } else {
      const newList = [...shortDomainList];
      const newItem = {
        shortName,
        domain
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

        this.setState({
          shortDomainList: newList,
        });
        this.closeForm();
      });
    }
  }

  handleDel(record) {
    const { shortDomainList } = this.state;
    const newList = shortDomainList.filter(item => item.shortName !== record.shortName);
    const result = window.confirm('确认删除？');

    if (result) {
      chrome.storage.sync.set({
        extensionShortDomain: [...newList]
      }, () => {
        alertCustom({
          msg: '删除成功！'
        });
        this.setState({
          shortDomainList: [...newList]
        });
      });
    }
  }

  render() {
    const { index, shortName, domain, shortDomainList, formShow, title } = this.state;
    const form = new Form({
      index,
      shortName,
      domain,
      formShow,
      title,
      closeForm: () => this.closeForm(),
      onSubmit: values => this.submitForm(values)
    });
    const table = new Table({
      index,
      shortName,
      domain,
      shortDomainList,
      formShow,
      title,
      clearAll: () => this.clearAll(),
      onDel: (record) => this.handleDel(record),
      openForm: (index, dataEdit) => this.openForm(index, dataEdit),
    });
    
    this.el = renderDom(`
      <div class="actions" >
        <button id="btn-add_${this.uuid}" class="primary btn-add" >添加</button>
      </div>
    `);

    mount(this.el, table);
    mount(this.el, form);
    
    this.el.querySelector(`#btn-add_${this.uuid}`).addEventListener('click', () => {
      this.openForm();
    });

    return this.el
  }
}

mount(root, new App());
