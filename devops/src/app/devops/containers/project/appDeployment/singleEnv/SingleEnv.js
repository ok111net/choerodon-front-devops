import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Table, Icon, Select, Button, Form, Dropdown, Menu, Progress, Tooltip } from 'choerodon-ui';
import _ from 'lodash';
import Action from 'Action';
import Permission from 'PerComponent';
import ValueConfig from '../valueConfig';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';
import DelIst from '../component/delIst/DelIst';
import '../AppDeploy.scss';
import '../../../main.scss';


const Option = Select.Option;

@inject('AppState')
@observer
class SingleEnvironment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appId: null,
      verId: null,
      envId: null,
      active: -1,
      pageSize: 10,
      page: 0,
    };
  }

  /**
   * 处理页面跳转
   * @param url 跳转地址
   */
  linkToChange = (url) => {
    const { history } = this.props;
    history.push(url);
  };

  /**
   * 查看部署详情
   * @param id 实例ID
   * @param status 实例状态
   */
  linkDeployDetail = (id, status) => {
    const { AppState } = this.props;
    const projectId = AppState.currentMenuType.id;
    const projectName = AppState.currentMenuType.name;
    const type = AppState.currentMenuType.type;
    this.linkToChange(`/devops/app-deployment/${id}/${status}/detail?type=${type}&id=${projectId}&name=${projectName}`);
  };

  /**
   * 查看版本特性
   * @param id 实例ID
   * @param istName 实例名
   */
  linkVersionFeature = (id, istName) => {
    const { store } = this.props;
    store.setAlertType('versionFeature');
    this.setState({ id, instanceName: istName });
    store.changeShow(true);
  };

  /**
   * envID & appID获取实例列表
   * @param envId
   * @param appId
   */
  loadDetail = (envId, appId) => {
    const { verId, active } = this.state;
    const { store } = this.props;
    let Active = 1;
    if (appId === store.getAppId) {
      Active = active * -1;
    }
    this.setState({
      appId,
      active: Active,
    });
    const envNames = store.getEnvcard;
    const envID = envId || envNames[0].id;
    if (Active > 0) {
      store.setAppId(appId);
      this.loadInstance(envID, verId, appId);
    } else {
      store.setAppId(false);
      this.loadInstance(envID, verId);
    }
  };

  /**
   * 查询应用标签及实例列表
   * @param id 环境id
   */
  loadSingleEnv = (id) => {
    const { store, AppState } = this.props;
    const projectId = AppState.currentMenuType.id;
    const { pageSize, appId } = this.state;
    const envID = id || null;
    this.setState({
      envId: envID,
    });
    store.setEnvId(envID);
    store.loadInstanceAll(projectId, 0, pageSize, null, envID, null, appId);
    if (id) {
      store.loadAppNameByEnv(projectId, id);
    }
  };

  /**
   * 获取实例列表
   * @param envId 环境id
   * @param verId 版本id
   * @param appId 应用id
   */
  loadInstance = (envId, verId, appId) => {
    const { store, AppState } = this.props;
    const projectId = AppState.currentMenuType.id;
    const { pageSize } = this.state;
    store.loadInstanceAll(projectId, 0, pageSize, null, envId, verId, appId);
  };

  /**
   * table 改变的函数
   * @param pagination 分页
   * @param filters 过滤
   * @param sorter 排序
   * @param param 搜索
   */
  tableChange =(pagination, filters, sorter, param) => {
    const { store, AppState } = this.props;
    const projectId = AppState.currentMenuType.id;
    const { envId, appId, verId } = this.state;
    const envNames = store.getEnvcard;
    const envID = envId || envNames[0].id;
    const sort = {};
    if (sorter.column) {
      const { field, order } = sorter;
      sort[field] = order;
    }
    let searchParam = {};
    if (Object.keys(filters).length) {
      searchParam = filters;
    }
    const postData = {
      searchParam,
      param: param.toString(),
    };
    this.setState({ page: pagination.current - 1, pageSize: pagination.pageSize });
    store.loadInstanceAll(projectId, pagination.current - 1,
      pagination.pageSize, sort, envID, verId, appId, postData);
  };

  /**
   * 条件部署应用
   * @param envId 环境ID
   * @param appId 应用ID
   */
  deployApp = (envId, appId) => {
    const { store, AppState } = this.props;
    const envNames = store.getEnvcard;
    const envID = envId || envNames[0].id;
    const projectId = AppState.currentMenuType.id;
    const projectName = AppState.currentMenuType.name;
    const type = AppState.currentMenuType.type;
    store.setIstAll('null');
    this.linkToChange(`/devops/deployment-app?envId=${envID}&appId=${appId}&type=${type}&id=${projectId}&name=${projectName}`);
  };

  /**
   * 修改配置实例信息
   * @param name 实例名
   * @param id 实例ID
   * @param envId
   * @param verId
   * @param appId
   */
  updateConfig = (name, id, envId, verId, appId) => {
    const { store, AppState } = this.props;
    const projectId = AppState.currentMenuType.id;
    this.setState({
      idArr: [envId, verId, appId],
      name,
    });
    store.setAlertType('valueConfig');
    store.loadValue(projectId, appId, envId, verId)
      .then((res) => {
        if (res && res.failed) {
          Choerodon.prompt(res.message);
        } else {
          this.setState({
            visible: true,
            id,
          });
        }
      });
  };

  /**
   * 关闭滑块
   * @param res 是否重新部署需要重载数据
   */
  handleCancel =(res) => {
    const { store } = this.props;
    const { envId, appId, page } = this.state;
    const menu = JSON.parse(sessionStorage.selectData);
    const projectId = menu.id;
    const envNames = store.getEnvcard;
    const envID = envId || (envNames.length ? envNames[0].id : null);
    this.setState({
      visible: false,
    });
    if (res) {
      store.loadInstanceAll(projectId, page, 10, null, envID, null, appId);
    }
    store.changeShow(false);
  };

  /**
   * 打开删除数据模态框
   * @param id
   */
  handleOpen(id) {
    this.setState({ openRemove: true, id });
  }

  /**
   * 删除数据
   */
  handleDelete = (id) => {
    const { store } = this.props;
    const { envId, appId, page } = this.state;
    const menu = JSON.parse(sessionStorage.selectData);
    const projectId = menu.id;
    const envNames = store.getEnvcard;
    const envID = envId || (envNames.length ? envNames[0].id : null);
    this.setState({
      loading: true,
    });
    store.deleteIst(projectId, id)
      .then((error) => {
        if (error && error.failed) {
          this.setState({
            openRemove: false,
            loading: false,
          });
          Choerodon.prompt(error.message);
        } else {
          this.setState({
            openRemove: false,
            loading: false,
          });
          store.loadInstanceAll(projectId, page, 10, null, envID, null, appId);
        }
      });
  };


  /**
   * 启停用实例
   * @param id 实例ID
   * @param status 状态
   */
  activeIst = (id, status) => {
    const { store, AppState } = this.props;
    const projectId = AppState.currentMenuType.id;
    const { envId, appId, page } = this.state;
    const envNames = store.getEnvcard;
    const envID = envId || (envNames.length ? envNames[0].id : null);
    store.changeIstActive(projectId, id, status)
      .then((error) => {
        if (error && error.failed) {
          Choerodon.prompt(error.message);
        } else {
          store.loadInstanceAll(projectId, page, 10, null, envID, null, appId);
        }
      });
  };

  /**
   * 关闭删除数据的模态框
   */
  handleClose = () => {
    this.setState({ openRemove: false });
  };

  render() {
    const { AppState, store } = this.props;
    const ist = store.getIstAll;
    const envNames = store.getEnvcard;
    const appNames = store.getAppNameByEnv;
    const appID = store.appId;
    const projectId = AppState.currentMenuType.id;
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;

    let envName = envNames.length ? (<React.Fragment>
      <div className={envNames[0].connect ? 'c7n-ist-status c7n-ist-status_running' : 'c7n-ist-status c7n-ist-status_failed'}>
        <div>{envNames[0].connect ? '运行中' : '未连接'}</div>
      </div>
      {envNames[0].name}
    </React.Fragment>) : Choerodon.getMessage('暂无环境', 'Null');

    if (envNames.length && store.envId) {
      _.map(envNames, (d) => {
        if (d.id === store.envId) {
          envName = (<React.Fragment>
            <div className={d.connect ? 'c7n-ist-status c7n-ist-status_running' : 'c7n-ist-status c7n-ist-status_failed'}>
              <div>{d.connect ? '运行中' : '未连接'}</div>
            </div>
            {d.name}
          </React.Fragment>);
        }
      });
    }

    const envNameDom = envNames.length ? _.map(envNames, d => (<Option key={d.id}>
      <div className={d.connect ? 'c7n-ist-status c7n-ist-status_running' : 'c7n-ist-status c7n-ist-status_failed'}>
        <div>{d.connect ? '运行中' : '未连接'}</div>
      </div>
      {d.name}</Option>)) : <Option key="null">无</Option>;

    const appNameDom = appNames.length ? _.map(appNames, d => (<div role="none" className={appID === d.id ? 'c7n-deploy-single_card c7n-deploy-single_card-active' : 'c7n-deploy-single_card'} onClick={this.loadDetail.bind(this, this.state.envId, d.id)}>
      <div className="c7n-deploy-square"><div>App</div></div>
      <span className="c7n-text-ellipsis"><MouserOverWrapper text={d.name || ''} width={150}>{d.name}</MouserOverWrapper></span>
      <Permission
        service={['devops-service.application-instance.deploy']}
        organizationId={organizationId}
        projectId={projectId}
        type={type}
      >
        <span role="none" className="icon-cloud_upload c7n-deploy-icon" onClick={this.deployApp.bind(this, this.state.envId, d.id)} />
      </Permission>
    </div>)) : (<div className="c7n-deploy-single_card" >
      <div className="c7n-deploy-square"><div>App</div></div>
      <span>暂无应用</span>
    </div>);

    const columns = [{
      title: Choerodon.languageChange('deploy.status'),
      key: 'podCount',
      filters: [],
      render: record => (
        <div className="c7n-deploy-status">
          <svg className={record.podCount === 0 ? 'c7n-deploy-circle-process-ban' : 'c7n-deploy-circle_red'}>
            <circle className="c7n-transition-rotate" cx="50%" cy="50%" r="40%" strokeWidth="16.5%" />
          </svg>
          <svg className={record.podCount === 0 ? 'c7n-deploy-circle-process-ban' : 'c7n-deploy-circle-process'}>
            <circle className="c7n-transition-rotate" cx="50%" cy="50%" r="40%" strokeWidth="16.5%" strokeDashoffset={`${251 * ((record.podCount - record.podRunningCount) / record.podCount)}%`} />
          </svg>
          <span className="c7n-deploy-status-num">{record.podCount}</span>
        </div>
      ),
    }, {
      title: Choerodon.languageChange('deploy.istStatus'),
      key: 'status',
      render: record => (
        <div>
          <div className={`c7n-ist-status c7n-ist-status_${record.status}`}>
            <div>{Choerodon.languageChange(record.status || 'null')}</div>
          </div>
        </div>
      ),
    }, {
      title: Choerodon.languageChange('deploy.instance'),
      key: 'code',
      filters: [],
      render: record => (record.commandStatus === 'success' ? <span className="c7n-deploy-istCode">{record.code}</span> : <div>
        {record.commandStatus === 'doing' ? (<div>
          <Tooltip title={Choerodon.languageChange(`ist_${record.commandType}`)}>
            <Progress type="loading" width="15px" />
          </Tooltip>
          <span className="c7n-deploy-istCode">{record.code}</span>
        </div>) :
          (<div>
            <Tooltip title={record.error}>
              <span className="icon-error c7n-deploy-ist-operate" />
            </Tooltip>
            <span className="c7n-deploy-istCode">{record.code}</span>
          </div>)}
      </div>),
    }, {
      title: '应用版本',
      key: 'appVersion',
      filters: [],
      render: record => (
        <div>
          <span className="c7n-deploy-circle-only">V</span>
          <span>{record.appVersion}</span>
        </div>
      ),
    }, {
      width: '40px',
      className: 'c7n-operate-icon',
      key: 'action',
      render: (test, record) => (
        <Action
          data={[
            {
              type,
              organizationId,
              projectId,
              service: ['devops-service.devops-pod.getLogs', 'devops-service.application-instance.listResources'],
              text: '查看实例详情',
              action: this.linkDeployDetail.bind(this, record.id, record.status),
            }, {
              type,
              organizationId,
              projectId,
              service: ['devops-service.application-instance.queryValues'],
              text: Choerodon.getMessage('修改配置信息', 'Modify configuration information'),
              action: this.updateConfig.bind(this, record.code, record.id,
                record.envId, record.appVersionId, record.appId),
            }, {
              type,
              organizationId,
              projectId,
              service: ['devops-service.application-instance.start', 'devops-service.application-instance.stop'],
              text: record.status !== 'stoped' ? Choerodon.getMessage('停止实例', 'Stop the instance') : Choerodon.getMessage('重启实例', 'Start the instance'),
              action: record.status !== 'stoped' ? this.activeIst.bind(this, record.id, 'stop') : this.activeIst.bind(this, record.id, 'start'),
            }, {
              type,
              organizationId,
              projectId,
              service: ['devops-service.application-instance.delete'],
              text: Choerodon.getMessage('删除实例', 'Delete the instance'),
              action: this.handleOpen.bind(this, record.id),
            },
          ]}
        />
      ),
    }];

    const detailDom = (<div className="c7n-deploy-single-wrap">
      <h2 className="c7n-space-first">应用</h2>
      <div>
        {appNameDom}
      </div>
      <h2>实例</h2>
      <Table
        onChange={this.tableChange}
        loading={store.getIsLoading}
        pagination={store.pageInfo}
        columns={columns}
        dataSource={ist}
        rowKey={record => record.id}
      />
    </div>);

    return (
      <div className="c7n-region">
        <Select defaultValue={envName} label="环境名称" className="c7n-app-select" onChange={this.loadSingleEnv} allowClear showSearch>
          {envNameDom}
        </Select>
        {detailDom}
        {this.state.visible && <ValueConfig
          store={this.props.store}
          visible={this.state.visible}
          name={this.state.name}
          id={this.state.id}
          idArr={this.state.idArr}
          onClose={this.handleCancel}
        /> }

        <DelIst
          open={this.state.openRemove}
          handleCancel={this.handleClose}
          handleConfirm={this.handleDelete.bind(this, this.state.id)}
          confirmLoading={this.state.loading}
        />
      </div>
    );
  }
}

export default withRouter(SingleEnvironment);
