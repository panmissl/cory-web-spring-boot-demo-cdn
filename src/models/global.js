import { doList } from '@/services/global';
import { log } from '@/utils/utils';

const GlobalModel = {
  namespace: 'global',
  state: {
  },
  effects: {
    /**
     * https://procomponents.ant.design/components/table#request
     * @param {*} payload {url, params(pageSize, current), sorter, filter}
     * @param {*} param1 
     * @returns {
     *    data: msg.result,
     *    // success 请返回 true，
     *    // 不然 table 会停止解析数据，即使有数据
     *    success: boolean,
     *    // 不传会使用 data 的长度，如果是分页一定要传
     *    total: number,
     * }
     */
    *list(payload, {call, put, select}) {
      //TODO 处理pageNo加1的情况
      const { url, params = { current: 1, pageSize: 20 }, sorter, filter } = payload;
      const { current : pageNo, pageSize } = params;

      log('url: ' + url + ', pageNo: ' + pageNo + ', pageSize: ' + pageSize + ', filter: ' + JSON.stringify(filter));

      const pagination = yield call(doList, {url, pageNo, pageSize, filter});
      yield put({type: 'saveList', payload: {list: pagination.list, totalCount: pagination.totalCount, pageNo, }});
    },
    /*
    *fetchNotices(_, { call, put, select }) {
      const data = yield call(queryNotices);
      yield put({
        type: 'saveNotices',
        payload: data,
      });
      const unreadCount = yield select(
        (state) => state.global.notices.filter((item) => !item.read).length,
      );
      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: data.length,
          unreadCount,
        },
      });
    },

    *clearNotices({ payload }, { put, select }) {
      yield put({
        type: 'saveClearedNotices',
        payload,
      });
      const count = yield select((state) => state.global.notices.length);
      const unreadCount = yield select(
        (state) => state.global.notices.filter((item) => !item.read).length,
      );
      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: count,
          unreadCount,
        },
      });
    },

    *changeNoticeReadState({ payload }, { put, select }) {
      const notices = yield select((state) =>
        state.global.notices.map((item) => {
          const notice = { ...item };

          if (notice.id === payload) {
            notice.read = true;
          }

          return notice;
        }),
      );
      yield put({
        type: 'saveNotices',
        payload: notices,
      });
      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: notices.length,
          unreadCount: notices.filter((item) => !item.read).length,
        },
      });
    },
    */
  },
  reducers: {
    saveList(state, { list, totalCount, pageNo }) {
      log('saveList', list);
      return { ...state, list, totalCount, pageNo, };
    },
    /*
    changeLayoutCollapsed(
      state = {
        notices: [],
        collapsed: true,
      },
      { payload },
    ) {
      return { ...state, collapsed: payload };
    },

    saveNotices(state, { payload }) {
      return {
        collapsed: false,
        ...state,
        notices: payload,
      };
    },

    saveClearedNotices(
      state = {
        notices: [],
        collapsed: true,
      },
      { payload },
    ) {
      return {
        ...state,
        collapsed: false,
        notices: state.notices.filter((item) => item.type !== payload),
      };
    },
    */
  },
};
export default GlobalModel;
