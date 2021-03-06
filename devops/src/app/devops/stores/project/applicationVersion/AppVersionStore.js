/**
 * Created by mading on 2017/11/27.
 */
import { observable, action, computed, autorun, whyRun } from 'mobx';
// import axios from 'Axios';
import axios from 'Axios';
import store from 'Store';
import { Observable } from 'rxjs';
import { List, formJS } from 'immutable';

@store('AppVersionStore')
class AppVersionStore {
  @observable allData = [];
  @observable isRefresh = false;// 页面的loading
  @observable loading = false; // 打开tab的loading
  @observable pageInfo = {
    current: 1, total: 0, pageSize: 10,
  };

  @action setPageInfo(page) {
    this.pageInfo.current = page.number + 1;
    this.pageInfo.total = page.totalElements;
    this.pageInfo.pageSize = page.size;
  }

  @computed get getPageInfo() {
    return this.pageInfo;
  }


  @computed get getAllData() {
    // window.console.log(this.allData);
    return this.allData.slice();
  }

  @action setAllData(data) {
    this.allData = data;
    // window.console.log(this.allData);
  }

  @action changeIsRefresh(flag) {
    this.isRefresh = flag;
  }

  @computed get getIsRefresh() {
    return this.isRefresh;
  }
  @action changeLoading(flag) {
    this.loading = flag;
  }

  @computed get getLoading() {
    return this.loading;
  }

  loadData = (isRefresh = false, proId, page, pageSize = 10, sort = { field: 'id', order: 'desc' }, datas = {
    searchParam: {},
    param: '',
  }) => {
    if (isRefresh) {
      this.changeIsRefresh(true);
    }
    this.changeLoading(true);
    return Observable.fromPromise(axios.post(`/devops/v1/project/${proId}/app_version/list_by_options?page=${page}&size=${pageSize}&sort=${sort.field},${sort.order}`, JSON.stringify(datas)))
      .subscribe((data) => {
        const res = this.handleProptError(data);
        if (res) {
          this.handleData(data);
        }
        this.changeLoading(false);
        this.changeIsRefresh(false);
      });
  };
  handleData =(data) => {
    this.setAllData(data.content);
    const { number, size, totalElements } = data;
    const page = { number, size, totalElements };
    this.setPageInfo(page);
  }
  handleProptError =(error) => {
    if (error && error.failed) {
      Choerodon.prompt(error.message);
      return false;
    } else {
      return error;
    }
  }
}

const appVersionStore = new AppVersionStore();
export default appVersionStore;

// autorun(() => {
//   window.console.log(templateStore.allData.length);
//   whyRun();
// });
