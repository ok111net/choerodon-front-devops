import React, { Component } from 'react';
import { Table, Button } from 'choerodon-ui';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import Permission from 'PerComponent';
import PageHeader from 'PageHeader';
import { fromJS, is } from 'immutable';
import { Obversable } from 'rxjs';

import { commonComponent } from '../../../../components/commonFunction';
import TimePopover from '../../../../components/timePopover';
import Loadingbar from '../../../../components/loadingBar';
import './ApplicationVersion.scss';
import '../../../main.scss';


@inject('AppState')
@commonComponent('AppVersionStore')
@observer
class ApplicationVersion extends Component {
  constructor(props) {
    super(props);
    const menu = this.props.AppState.currentMenuType;
    this.state = {
      page: 0,
      id: '',
      projectId: menu.id,
      show: false,
    };
  }

  componentDidMount() {
    this.loadAllData(this.state.page);
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    if (this.props.form.isFieldsTouched()) {
      return true;
    }
    const thisProps = fromJS(this.props || {});
    const thisState = fromJS(this.state || {});
    const nextStates = fromJS(nextState || {});
    if (thisProps.size !== nextProps.size ||
      thisState.size !== nextState.size) {
      return true;
    }
    if (is(thisState, nextStates)) {
      return false;
    }
    return true;
  };

  getColumn = () => {
    const { type, id: orgId } = this.props.AppState.currentMenuType;
    return [{
      title: Choerodon.languageChange('app.version'),
      dataIndex: 'version',
      key: 'version',
      sorter: true,
      filters: [],
      filterMultiple: false,
    },
    //   {
    //   title: Choerodon.languageChange('app.commit'),
    //   dataIndex: 'commit',
    //   key: 'commit',
    //   sorter: (a, b) => a.commit.localeCompare(b.commit, 'zh-Hans-CN',
      // { sensitivity: 'accent' }),
    // },
    {
      width: '410px',
      title: Choerodon.languageChange('app.code'),
      dataIndex: 'appCode',
      key: 'appCode',
      sorter: true,
      filters: [],
      filterMultiple: false,
    }, {
      // width: '410px',
      title: Choerodon.languageChange('app.name'),
      dataIndex: 'appName',
      key: 'appName',
      sorter: true,
      filters: [],
      filterMultiple: false,
    }, {
      // width: '410px',
      title: Choerodon.languageChange('app.createTime'),
      dataIndex: 'creationDate',
      key: 'creationDate',
      sorter: true,
      render: (text, record) => <TimePopover content={record.creationDate} />,
    },
    ];
  } ;
  render() {
    const { AppVersionStore } = this.props;
    const serviceData = AppVersionStore.getAllData;
    const { type, id: orgId } = this.props.AppState.currentMenuType;
    const contentDom = (
      <Table
        // filters={['appCode', 'appName', 'version']}
        loading={AppVersionStore.loading}
        pagination={AppVersionStore.pageInfo}
        columns={this.getColumn()}
        dataSource={serviceData}
        rowKey={record => record.id}
        onChange={this.tableChange}
      />);

    return (
      <div className="c7n-region page-container c7n-appVersion-wrapper">
        {AppVersionStore.isRefresh ? <Loadingbar display /> : <React.Fragment>
          <PageHeader title={Choerodon.languageChange('app.version')}>
            <Permission
              service={''}
              type={type}
              projectId={orgId}
            >
              <Button
                className="leftBtn"
                onClick={this.handleRefresh}
              >
                <span className="icon-refresh page-head-icon" />
                <span className="icon-space">{Choerodon.languageChange('refresh')}</span>
              </Button>
            </Permission>
          </PageHeader>
          <div className="page-content">
            <h2 className="c7n-space-first">项目&quot;{this.props.AppState.currentMenuType.name}&quot;的应用版本管理</h2>
            <p>
              这些权限会影响此项目及其所有资源。
              <a href="http://choerodon.io/zh/docs/user-guide/assembly-line/service-version/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
                <span className="c7n-external-link-content">
                  了解详情
                </span>
                <span className="icon-open_in_new" />
              </a>
            </p>
            {contentDom}
          </div>

        </React.Fragment>}

      </div>
    );
  }
}

export default withRouter(ApplicationVersion);
