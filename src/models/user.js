import { doLogin, doLogout, queryCurrentUser } from '@/services/user';
import { setAuthority } from '@/utils/authority';

const UserModel = {
  namespace: 'user',
  state: {
    localUser: false,
    loginError: false,
  },
  effects: {
    *login({ payload }, { call, put }) {
      const success = yield call(doLogin, payload);
      const currentUser = success ? yield call(queryCurrentUser) : null;
      window.USER = currentUser;
      yield put({
        type: 'saveCurrentUser',
        payload: { loginMode: true, loginError: !success },
      });
    },

    *logout() {
      yield doLogout();
      delete window.USER;
      window.location.href = '/login';
    },
  },
  reducers: {
    saveCurrentUser(state, { payload }) {
      const { loginError, loginMode } = payload;

      //setAuthority(payload.currentAuthority);
      return { ...state, loginError, loginMode };
    },
  },
};
export default UserModel;
