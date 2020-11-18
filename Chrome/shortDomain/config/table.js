class Table extends Component {
  constructor(props = {}) {
    super(props);
  }

  render() {
    const { shortDomainList, onDel, openForm, clearAll } = this.props;

    this.el = renderDom(`
      <div class="short-domain-existed" >
        <h2>
          已设置的短域名
        </h2>

        <div class="short-domain-existed__actions" >
          <button id="btn-clear_${this.uuid}" class="primary clearList" ${!shortDomainList.length ? 'disabled="true"' : ''} >清空</button>
        </div>

        <table id="short-domain-existed__table${this.uuid}" class="short-domain-existed__table" >
          <thead>
            <th>序号</th>
            <th>短域名</th>
            <th>url</th>
            <th>操作</th>
          </thead>

          ${
            shortDomainList.length ? shortDomainList.map((item, index) => {
              return `
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
            }).join('') : `
              <tr>
                <td colspan="4" >暂无设置</td>
              </tr>
            `
          }
        </table>
      </div>
    `);

    this.el.querySelector(`#btn-clear_${this.uuid}`).addEventListener('click', () => {
      clearAll();
    });
    this.el.querySelector(`#short-domain-existed__table${this.uuid}`).addEventListener('click', (e) => {
      const target = e.target;
      const classList = target.classList;
    
      if (target && target.nodeName && target.nodeName.toUpperCase() === 'BUTTON' && classList) {
        const recordStr = target.dataset.item;
    
        if (!recordStr) {
          return;
        }
    
        const record = JSON.parse(target.dataset.item);
    
        if (Array.prototype.indexOf.call(classList, 'delete-action') > -1) {
          onDel(record);
        } else if (Array.prototype.indexOf.call(classList, 'edit-action') > -1) {
          openForm(record.index, {
            ...record
          });
        }
      }
    });

    return this.el;
  }
}