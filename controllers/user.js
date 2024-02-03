const User = require("../model/user");
exports.Signup = (req, res, next) => {
  try {
    res.render("users/signup");
  } catch (err) {
    next(err);
  }
};

exports.Create = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const newUser = await new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to YelpCamp");
      res.redirect("/campgrounds");
    });
  } catch (err) {
    if (err.message.includes("username is already registered")) {
      req.flash("error", "Username is already registered with another account");
    } else if (
      err.message.includes(
        " duplicate key error collection: yelp-camp.users index: email_1 dup key: { email: "
      )
    ) {
      req.flash("error", "Email is already registered with another account");
    } else {
      req.flash("error", err.message);
    }

    res.redirect("/signup");
  }
};

exports.Login = (req, res, next) => {
  try {
    res.render("users/login");
  } catch (err) {
    next(err);
  }
};

exports.LoginPost = (req, res) => {
  req.flash("success", "Welcome Back");
  res.redirect(req.session.returnTo || "/campgrounds");
};

exports.Logout = (req, res) => {
  req.logout(() => {
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
};
