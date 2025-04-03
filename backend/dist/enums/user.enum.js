"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = exports.UserSex = exports.UserRoles = void 0;
var UserRoles;
(function (UserRoles) {
    UserRoles["USER"] = "user";
    UserRoles["ADMIN"] = "admin";
    UserRoles["EMPLOYEE"] = "employee";
})(UserRoles || (exports.UserRoles = UserRoles = {}));
var UserSex;
(function (UserSex) {
    UserSex["MALE"] = "male";
    UserSex["FEMALE"] = "female";
    UserSex["OTHER"] = "other";
    UserSex["PREFER_NOT_TO_SAY"] = "prefer not to say";
})(UserSex || (exports.UserSex = UserSex = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["PENDING"] = "pending";
    UserStatus["AVAILABLE"] = "AVAILABLE";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
//# sourceMappingURL=user.enum.js.map