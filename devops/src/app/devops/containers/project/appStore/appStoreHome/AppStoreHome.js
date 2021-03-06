import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Input, Icon, Card } from 'choerodon-ui';
import PageHeader from 'PageHeader';
import './AppStore.scss';
import '../../../main.scss';

@inject('AppState')
@observer
class AppStoreHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      val: null,
    };
  }

  onSearch = () => {
    this.searchInput.focus();
    this.setState({ val: '' });
  };

  onChangeSearch = (e) => {
    this.setState({ val: e.target.value });
  };

  /**
   * 跳转部署应用
   */
  appDetail = (id) => {
    const { AppState } = this.props;
    const projectId = AppState.currentMenuType.id;
    const projectName = AppState.currentMenuType.name;
    const type = AppState.currentMenuType.type;
    this.linkToChange(`/devops/appstore/${id}/app?type=${type}&id=${projectId}&name=${projectName}`);
  };

  /**
   * 处理页面跳转
   * @param url 跳转地址
   */
  linkToChange = (url) => {
    const { history } = this.props;
    history.push(url);
  };


  render() {
    const { AppStoreStore, AppState } = this.props;
    const prefix = <Icon type="search" onClick={this.onSearch} />;

    return (
      <div className="c7n-region page-container">
        <PageHeader title={Choerodon.languageChange('appstore.title')}>
          <Button
            className="leftBtn"
            funcType="flat"
            onClick={this.reload}
          >
            <span className="icon-refresh page-head-icon" />
            <span className="icon-space">{Choerodon.languageChange('refresh')}</span>
          </Button>
        </PageHeader>
        <div className="c7n-store-content">
          <h2 className="c7n-space-first">应用市场</h2>
          <p>
            这里是应用市场的描述。
            <a href="http://c7n.saas.hand-china.com/docs/devops/develop/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
                了解详情
              </span>
              <span className="icon-open_in_new" />
            </a>
          </p>
          <div className="c7n-store-search">
            <Input
              placeholder="搜索应用名称或类型"
              value={this.state.val}
              prefix={prefix}
              onChange={this.onChangeSearch}
              // eslint-disable-next-line no-return-assign
              ref={node => this.searchInput = node}
            />
          </div>
          <Card title="Card title" style={{ width: 300 }}>
            <Button
              onClick={this.appDetail.bind(this, 99)}
            >
              详情
            </Button>
            <p>Card content</p>
            <p>Card content</p>
          </Card>
        </div>
      </div>
    );
  }
}

export default withRouter(AppStoreHome);
