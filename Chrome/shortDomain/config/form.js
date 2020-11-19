class Form extends Component {
  constructor(props = {}) {
    super(props);

    this.state = {
      shortName: props.shortName || '',
      domain: props.domain || ''
    };
  }

  handleChange(e, name) {
    const { domain, shortName } = this.state;

    this.state[name] = e.target.value;

    const btnSubmit = this.el.querySelector(`#form-actions--submit__${this.uuid}`);
    if (!shortName || !domain) {
      btnSubmit.setAttribute('disabled', true);
    } else {
      btnSubmit.removeAttribute('disabled');
    }
  }

  handleSubmit() {
    const { onSubmit } = this.props;
    onSubmit({
      ...this.state
    });
  }

  render() {
    const { domain, shortName } = this.state;
    const {
      formShow,
      title,
      closeForm
    } = this.props;
    
    this.el = renderDom(`
      <div class="form-wrapper ${formShow ? 'show' : ''}" >
        <div class="form-content" >
          <h3 class="form-title" >
            ${title}
          </h3>

          <div>
            <span>短域名：</span>
            <input id="shortName_${this.uuid}" type="text" value="${shortName}" placeholder="请输入短域名" />
          </div>
          
          <div>
            <span>url：</span>
            <input id="domain_${this.uuid}" type="text" value="${domain}" placeholder="请输入域" />
          </div>
          
          <div class="form-footer" >
            <button id="form-actions--submit__${this.uuid}" class="form-actions form-actions--submit primary" ${!shortName || !domain ? 'disabled="true"' : ''} >提交</button>
            <button id="form-actions--cancel__${this.uuid}" class="form-actions form-actions--cancel default" >取消</button>
          </div>
        </div>
      </div>
    `);
    
    this.el.querySelector(`#shortName_${this.uuid}`).addEventListener('input', (e) => this.handleChange(e, 'shortName'));
    this.el.querySelector(`#domain_${this.uuid}`).addEventListener('input', (e) => this.handleChange(e, 'domain'));
    this.el.querySelector(`#form-actions--cancel__${this.uuid}`).addEventListener('click', () => closeForm());
    this.el.querySelector(`#form-actions--submit__${this.uuid}`).addEventListener('click', () => this.handleSubmit());

    return this.el;
  }
}