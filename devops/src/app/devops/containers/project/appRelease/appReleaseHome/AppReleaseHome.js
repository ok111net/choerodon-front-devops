import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Table, Popover } from 'choerodon-ui';
import PageHeader from 'PageHeader';
import Permission from 'Permission';
import Remove from 'Remove';
import _ from 'lodash';
import { commonComponent } from '../../../../components/commonFunction';
import TimePopover from '../../../../components/timePopover';
import Loadingbar from '../../../../components/loadingBar';
import '../../../main.scss';
import AppReleaseEdit from '../appReleaseEdit';
import Ace from '../../../../components/yamlAce';

@inject('AppState')
@commonComponent ('AppReleaseStore')
@observer
class AppReleaseHome extends Component {
  constructor(props) {
    const menu = props.AppState.currentMenuType;
    super(props);
    this.state = {
      openRemove: false,
      show: false,
      projectId: menu.id,
    };
  }
  componentDidMount() {
    const { projectId } = this.state;
    this.loadAllData(this.state.page);
  }

  getColumn = () => {
    const { type, id: orgId } = this.props.AppState.currentMenuType;
    return [{
      width: '410px',
      title: Choerodon.languageChange('app.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      filters: [],
    }, {
      width: '410px',
      title: Choerodon.languageChange('app.code'),
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      filters: [],
    }, {
      // width: '410px',
      title: '发布层级',
      dataIndex: 'publishLevel',
      key: 'publishLevel',
      sorter: true,
      filters: [],
    }, {
      // width: '410px',
      title: Choerodon.languageChange('deploy.ver'),
      key: 'appVersion',
      sorter: true,
      filters: [],
      render: record => (
        <React.Fragment>
          {_.map(record.appVersions, versions =>
            (<div key={versions.version}>
              <span className="c7n-network-circle">V</span>
              <span className="c7n-network-text_gray">{versions.version}</span>
            </div>))}
        </React.Fragment>),
    }, {
      width: '98px',
      key: 'action',
      className: 'c7n-network-text_top',
      render: record => (
        <div>
          <Popover trigger="hover" placement="bottom" content={<div>修改</div>}>
            <Button shape="circle" funcType="flat" onClick={this.showSidebar.bind(this, 'edit', record.id)}>
              <span className="icon-mode_edit" />
            </Button>
          </Popover>
          <Popover trigger="hover" placement="bottom" content={<div>删除</div>}>
            <Button shape="circle" funcType="flat" onClick={this.openRemove.bind(this, record.id)}>
              <span className="icon-delete_forever" />
            </Button>
          </Popover>
        </div>
      ),
    }];
  } ;

  showSidebar = (ids) => {
    const { name, id } = this.props.AppState.currentMenuType;
    if (ids) {
      this.props.history.push(`/devops/app-release/edit/${id}?type=project&id=${name}&name=${name}`);
    } else {
      this.props.history.push(`/devops/app-release/add?type=project&id=${id}&name=${name}`);
    }
  };


  render() {
    const { AppReleaseStore } = this.props;
    const data = AppReleaseStore.allData || [{
      name: 'yesy',
      code: 'yeysu',
      appVersions: [{ version: 'ttyy' }],
      publishLevel: '组织',
      id: 1,
    }];
    return (
      <div className="c7n-region page-container">
        <PageHeader title="应用发布">
          <Button
            className="header-btn headLeftBtn leftBtn"
            ghost
            onClick={this.showSidebar.bind(this, '')}
          >
            <span className="icon-playlist_add" />
            <span className="icon-space">创建</span>
          </Button>
          <Button
            className="header-btn headRightBtn leftBtn2"
            ghost
            onClick={this.handleRefresh}
          >
            <span className="icon-refresh" />
            <span className="icon-space">刷新</span>
          </Button>
        </PageHeader>
        <div className="page-content">
          <h2 className="c7n-space-first">项目&quot;{this.props.AppState.currentMenuType.name}&quot;的应用管理</h2>
          <p>
            这些权限会影响此项目及其所有资源。
            <a href="http://choerodon.io/zh/docs/user-guide/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
                了解详情
              </span>
            </a>
          </p>
          <Ace sourceData={AppReleaseStore.data1} value={AppReleaseStore.data2} />
          <Table
            // filters={['appCode', 'appName', 'version']}
            loading={AppReleaseStore.loading}
            pagination={AppReleaseStore.pageInfo}
            columns={this.getColumn()}
            dataSource={data}
            rowKey={record => record.id}
            onChange={this.tableChange}
          />
        </div>
        { this.state.show && <AppReleaseEdit
          visible={this.state.show}
          store={AppReleaseStore}
        /> }
        <Remove
          delTip={Choerodon.languageChange('service.delete.tip')}
          open={this.state.openRemove}
          handleCancel={this.closeRemove}
          handleConfirm={this.handleDelete}
        />
      </div>

    );
  }
}

export default withRouter(AppReleaseHome);
