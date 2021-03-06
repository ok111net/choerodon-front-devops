/* eslint-disable react/no-string-refs */
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Modal } from 'choerodon-ui';
import ReactAce from 'react-ace-editor';
import yaml from 'js-yaml';

import 'brace/mode/yaml';
import 'brace/theme/github';
import Ace from '../../../../components/yamlAce';
import '../AppDeploy.scss';
import '../../../main.scss';
import DeploymentAppStore from '../../../../stores/project/deploymentApp';


const { Sidebar } = Modal;

@inject('AppState')
@observer
class ValueConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };
  }

  componentWillReceiveProps() {
    const value = yaml.safeLoad(this.props.store.getValue);
    this.setState({
      value,
    });
  }

  onLoad = () => {
    const value = yaml.safeLoad(this.props.store.getValue);
    this.setState({
      value,
    });
  };

  /**
   * 事件处理，修改value值后写入store
   * @param {*} value 修改后的value值
   */
  onChange = (value) => {
    // yaml.safeLoad(value);
    this.setState({
      value,
    });
  };

  onClose = (res) => {
    this.setState({
      value: this.props.store.getValue,
    });
    this.props.onClose(res);
  };

  handleOk = () => {
    const { store, id, idArr, AppState } = this.props;
    const projectId = AppState.currentMenuType.id;
    let value = '';
    if (this.state.value) {
      try {
        value = JSON.stringify(yaml.safeLoad(this.state.value));
      } catch (err) {
        Choerodon.prompt('yaml文件格式出错');
        return;
      }
    } else {
      value = JSON.stringify(yaml.safeLoad(this.props.store.getValue[0]));
    }
    const data = {
      values: value,
      appInstanceId: id,
      environmentId: idArr[0],
      appVerisonId: idArr[1],
      appId: idArr[2],
      type: 'update',
    };
    store.reDeploy(projectId, data)
      .then((res) => {
        if (res && res.failed) {
          Choerodon.prompt(res.message);
        } else {
          this.onClose(res);
        }
      });
  };

  render() {
    const value = this.props.store.getValue;
    let changData = '';
    let soure = '';
    if (value.length === 1) {
      soure = value[0];
    } else if (value.length === 2) {
      soure = value[0];
      changData = value[1];
    }
    const sideDom = (<div>
      <h2 className="c7n-space-first">对&quot;{this.props.name}&quot;进行修改</h2>
      <p>
        对实例配置信息进行修改后重新部署。
        <a href="http://choerodon.io/zh/docs/user-guide/deploy/application-deployment/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
          <span className="c7n-external-link-content">
            了解详情
          </span>
          <span className="icon-open_in_new" />
        </a>
      </p>
      <div className="c7n-section">
        <div className="c7n-body-section c7n-border-done">
          <div>
            {value.length >= 1 && <Ace
              height={500}
              sourceData={soure}
              value={changData}
              onChange={this.onChange}
            /> }
          </div>
        </div>
      </div>
    </div>);
    return (<Sidebar
      title={Choerodon.getMessage('修改配置信息', 'Modify configuration information')}
      visible={this.props.visible}
      onOk={this.handleOk}
      onCancel={this.onClose.bind(this, false)}
      cancelText={Choerodon.languageChange('cancel')}
      okText={Choerodon.getMessage('重新部署', 'Redeploy')}
    >
      {sideDom}
    </Sidebar>);
  }
}

export default withRouter(ValueConfig);
