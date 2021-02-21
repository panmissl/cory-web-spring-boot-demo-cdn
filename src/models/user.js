import { doLogin, doLogout, queryCurrentUser as queryCurrentUserApi } from '@/services/user';
import { setAuthority } from '@/utils/authority';

const UserModel = {
  namespace: 'user',
  state: {
    currentUser: null,
    localUser: false,
    loginError: false,
  },
  effects: {
    *queryCurrentUser(_, { select, call, put }) {
      const currentUser = yield select(state => state.currentUser);
      if (currentUser) {
        yield put({
          type: 'saveCurrentUser',
          payload: { currentUser, localUser: true, loginError: false },
        });
      } else {
        const currentUser = yield queryCurrentUserApi();
        yield put({
          type: 'saveCurrentUser',
          payload: { currentUser, localUser: true, loginError: false },
        });
      }
    },

    *login({ payload }, { call, put }) {
      const success = yield call(doLogin, payload);
      const currentUser = success ? yield queryCurrentUserApi() : null;
      yield put({
        type: 'saveCurrentUser',
        payload: { currentUser, localUser: false, loginError: !success },
      });
    },

    *logout() {
      yield doLogout();
      yield put({
        type: 'saveCurrentUser',
        payload: { currentUser: null },
      });
      window.location.href = '/login';
    },
  },
  reducers: {
    saveCurrentUser(state, { payload }) {
      const { currentUser, loginError, localUser } = payload;

      if (currentUser) {
        currentUser.avatar = 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png';
        currentUser.name = currentUser.phone || currentUser.email;
      }

      setAuthority(payload.currentAuthority);
      return { ...state, currentUser, loginError, localUser };
    },
  },
};
export default UserModel;
