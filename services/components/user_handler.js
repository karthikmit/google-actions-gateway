class UserHandler {

    constructor() {
        this.userMap = {

        }
    }

    getUserInfo(userId) {
        return this.userMap[userId];
    }

    setUserInfo(userId, userInfo) {
        this.userMap[userId] = userInfo;
    }
}

module.exports = {
  userHandler : new UserHandler()
};