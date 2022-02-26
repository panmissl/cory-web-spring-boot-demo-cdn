import { fakeChartData, queryActivities, queryCurrent, queryProjectNotice } from './service';
const Model = {
  namespace: 'dashboardAndworkplace',
  state: {
    projectNotice: [],
    activities: [],
    radarData: [],
  },
  effects: {
  },
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },

    clear() {
      return {
        projectNotice: [],
        activities: [],
        radarData: [],
      };
    },
  },
};
export default Model;
