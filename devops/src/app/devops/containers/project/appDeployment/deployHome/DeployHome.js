import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button } from 'choerodon-ui';
import PageHeader from 'PageHeader';
import Permission from 'PerComponent';
import SingleApp from '../singleApp';
import SingleEnv from '../singleEnv';
import AppInstance from '../appInstance';
import MutiDeployment from '../mutiDeployment';
import './DeployHome.scss';
import '../AppDeploy.scss';
import '../../../main.scss';

@inject('AppState')
@observer
class DeployHome extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      tabActive: 'instance',
      page: 0,
    };
  }

  componentDidMount() {
    const { AppDeploymentStore } = this.props;
    const tabActive = AppDeploymentStore.getTabActive;
    this.loadEnvCards();
    this.loadAppName();
    if (tabActive) {
      this.changeTabs(tabActive);
    } else {
      this.loadIstAlls();
    }
  }

  /**
   * 刷新函数
   */
  reload = () => {
    const { AppDeploymentStore } = this.props;
    const tabActive = AppDeploymentStore.getTabActive;
    this.changeTabs(tabActive);
  };

  /**
   * 获取可用环境
   */
  loadEnvCards = () => {
    const { AppDeploymentStore, AppState } = this.props;
    const projectId = AppState.currentMenuType.id;
    AppDeploymentStore.loadActiveEnv(projectId);
  };

  /**
   * 加载部署实例
   */
  loadIstAlls = (pages = 0) => {
    const { AppDeploymentStore, AppState } = this.props;
    const projectId = AppState.currentMenuType.id;
    AppDeploymentStore.loadInstanceAll(projectId, pages);
  };

  /**
   * 获取应用名称
   */
  loadAppName = () => {
    const { AppDeploymentStore, AppState } = this.props;
    const projectId = AppState.currentMenuType.id;
    AppDeploymentStore.loadAppNames(projectId);
  };

  /**
   * 查询多应用部署数据
   */
  loadMuti = () => {
    const { AppDeploymentStore, AppState } = this.props;
    const projectId = AppState.currentMenuType.id;
    AppDeploymentStore.loadMutiData(projectId);
  };

  /**
   * 查询应用标签及实例列表
   * @param envId
   */
  loadSingleEnv = (envId) => {
    const { AppDeploymentStore } = this.props;
    const menu = JSON.parse(sessionStorage.selectData);
    const projectId = menu.id;
    AppDeploymentStore.loadInstanceAll(projectId, 0, 10, null, envId);
    AppDeploymentStore.loadAppNameByEnv(projectId, envId);
  };

  /**
   * 获取应用版本
   */
  loadAppVer = (id) => {
    const { AppDeploymentStore, AppState } = this.props;
    const projectId = AppState.currentMenuType.id;
    const envNames = AppDeploymentStore.getEnvcard;
    const envID = AppDeploymentStore.getEnvId || envNames[0].id;
    const verID = AppDeploymentStore.getVerId;
    if (envNames[0].id) {
      this.loadInstance(envID, verID, id);
    }
    AppDeploymentStore.loadAppVersion(projectId, id);
  };

  /**
   * 获取实例列表
   * @param envId 环境id
   * @param verId 版本id
   * @param appId 应用id
   */
  loadInstance = (envId, verId, appId) => {
    const { AppDeploymentStore, AppState } = this.props;
    const projectId = AppState.currentMenuType.id;
    AppDeploymentStore.loadInstanceAll(projectId, 0, 10, null, envId, verId, appId);
  };

  /**
   * 切换子页面
   * @param tabName 子页面标识
   */
  changeTabs = (tabName) => {
    const { AppDeploymentStore } = this.props;
    AppDeploymentStore.setTabActive(tabName);
    if (tabName === 'singleApp') {
      this.loadEnvCards();
      this.loadAppName();
      const appNames = AppDeploymentStore.getAppNames;
      if (appNames.length) {
        this.loadAppVer(AppDeploymentStore.appId || appNames[0].id);
      }
    } else if (tabName === 'multiApp') {
      this.loadEnvCards();
      this.loadMuti();
    } else if (tabName === 'instance') {
      this.loadIstAlls();
    } else if (tabName === 'singleEnv') {
      const envNames = AppDeploymentStore.getEnvcard;
      AppDeploymentStore.setAppId(false);
      if (envNames.length) {
        this.loadSingleEnv(AppDeploymentStore.envId || envNames[0].id);
      }
    }
  };

  /**
   * 跳转部署应用
   */
  deployApp = () => {
    const { AppState } = this.props;
    const projectId = AppState.currentMenuType.id;
    const projectName = AppState.currentMenuType.name;
    const type = AppState.currentMenuType.type;
    this.linkToChange(`/devops/deployment-app?type=${type}&id=${projectId}&name=${projectName}`);
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
    const { AppDeploymentStore, AppState } = this.props;
    const projectName = AppState.currentMenuType.name;
    const projectId = AppState.currentMenuType.id;
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;
    const tabActive = AppDeploymentStore.getTabActive;

    return (
      <div className="c7n-region page-container">
        <PageHeader title={Choerodon.languageChange('deploy.title')}>
          <Permission
            service={['devops-service.application-instance.deploy']}
            organizationId={organizationId}
            projectId={projectId}
            type={type}
          >
            <Button
              className="leftBtn"
              funcType="flat"
              onClick={this.deployApp}
            >
              <span className="icon-cloud_upload page-head-icon" />
              <span className="icon-space">部署应用</span>
            </Button>
          </Permission>
          <Button
            className="leftBtn2"
            funcType="flat"
            onClick={this.reload}
          >
            <span className="icon-refresh page-head-icon" />
            <span className="icon-space">{Choerodon.languageChange('refresh')}</span>
          </Button>
        </PageHeader>
        <div className="page-content">
          <h2 className="c7n-space-first">项目&quot;{projectName}&quot;的应用部署</h2>
          <p>
            您可在此用四种方式查看该项目下应用的部署情况。
            <a href="http://choerodon.io/zh/docs/user-guide/deploy/application-deployment/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
                了解详情
              </span>
              <span className="icon-open_in_new" />
            </a>
          </p>
          <div className="c7n-deploy-tab">
            <span>查看视图：</span>
            <Button
              funcType="flat"
              className={tabActive === 'instance' && 'c7n-tab-active'}
              onClick={this.changeTabs.bind(this, 'instance')}
            >
              部署实例
            </Button>
            <Button
              funcType="flat"
              className={tabActive === 'singleEnv' && 'c7n-tab-active'}
              onClick={this.changeTabs.bind(this, 'singleEnv')}
            >
              单环境
            </Button>
            <Button
              funcType="flat"
              className={tabActive === 'singleApp' && 'c7n-tab-active'}
              onClick={this.changeTabs.bind(this, 'singleApp')}
            >
              单应用
            </Button>
            <Button
              funcType="flat"
              className={tabActive === 'multiApp' && 'c7n-tab-active'}
              onClick={this.changeTabs.bind(this, 'multiApp')}
            >
              多应用
            </Button>
          </div>
          {tabActive === 'multiApp' && <MutiDeployment key="multiApp" store={AppDeploymentStore} />}
          {tabActive === 'singleApp' && <SingleApp key="singleApp" store={AppDeploymentStore} />}
          {tabActive === 'singleEnv' && <SingleEnv key="singleEnv" store={AppDeploymentStore} />}
          {tabActive === 'instance' && <AppInstance key="instance" store={AppDeploymentStore} />}
        </div>
      </div>
    );
  }
}

export default withRouter(DeployHome);
