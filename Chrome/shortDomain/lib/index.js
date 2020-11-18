function uuid(lenIn, radixIn) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  let uuid = [],
      i;
  
  const len = lenIn || undefined;
  const radix = radixIn || chars.length;

  if (len) {
    for (i = 0; i < len; i++) {
      uuid[i] = chars[0 | Math.random() * radix];
    }
  } else {
    let r;
    
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';
    
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
  }
  return uuid.join('');
};

const renderDom = (dom) => {
  const fragment = document.createElement('div');

  if (typeof dom === 'string') {
    const div = document.createElement('div');
    
    div.innerHTML = dom;
    const children = div.children;
  
    children && [...children].forEach(child => {
      fragment.appendChild(child);
    });
  } else if (dom) {
    fragment.appendChild(dom);
  }
  
  return fragment;
}

function mount(wrapper, child) {
  wrapper.appendChild(child.render());

  child.onStateChange = (oldEl, newEl) => {
    wrapper.insertBefore(newEl, oldEl);
    wrapper.removeChild(oldEl);
  };
}

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

  parseInt(div.offsetTop);
  div.style.opacity = 1;
  
  setTimeout(() => {
    div.style.opacity = 0;
    
    setTimeout(() => {
      document.body.removeChild(div);
    }, 200);
  }, timeout);
};

class Component {
  uuid = uuid();

  constructor(props) {
    this.props = props;
    this.state = {};
  }

  setState(state) {
    this.state = {
      ...this.state,
      ...state
    }

    this.oldEl = this.el;

    this.el = this.render && this.render();
    this.onStateChange && this.onStateChange(this.oldEl, this.el);
  }
}
