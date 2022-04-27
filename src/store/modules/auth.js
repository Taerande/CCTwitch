export const userinfo = {
  state: {
    userInfo: null,
  },
  mutations:{
    SET_UserInfo(state, response) {
      state.userInfo = response;
    },
  }
}
