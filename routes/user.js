const express = require("express");
const router = express.Router();
const User = require("../model/user");
const passport = require("passport");
const Users = require("../controllers/user");

router.route("/signup").get(Users.Signup).post(Users.Create);

router
  .route("/login")
  .get(Users.Login)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    Users.LoginPost
  );

router.get("/logout", Users.Logout);
module.exports = router;
