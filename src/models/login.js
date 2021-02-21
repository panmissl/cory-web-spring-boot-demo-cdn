import { doLogin } from '@/services/login';
import { queryCurrentUser } from '@/services/user';
import { setAuthority } from '@/utils/authority';
import { getPageQuery, log } from '@/utils/utils';
import { stringify } from 'querystring';
import { history } from 'umi';

const Model = {
  namespace: 'login',
  state: {},
  effects: {
    *currentUser({}, { put }) {
      const currentUser = yield queryCurrentUser();
      yield put({
        type: 'changeLoginStatus',
        payload: { currentUser, init: true, getLoggedInUser: true, login: false },
      });
    },

    *login({ payload }, { call, put }) {
      const success = yield call(doLogin, payload);
      const currentUser = success ? yield queryCurrentUser() : null;
      yield put({
        type: 'changeLoginStatus',
        payload: { currentUser, success, init: true, login: true, getLoggedInUser: false },
      }); // Login successfully
    },

    logout() {
      const { redirect } = getPageQuery(); // Note: There may be security issues, please note

      if (window.location.pathname !== '/user/login' && !redirect) {
        history.replace({
          pathname: '/user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        });
      }
    },
  },
  reducers: {
    changeLoginStatus(state, { payload }) {
      log('change login status', payload);

      setAuthority(payload.currentAuthority);
      return { ...state, ...payload };
    },
  },
};
export default Model;
