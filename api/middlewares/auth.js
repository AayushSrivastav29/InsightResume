const jwt = require("jsonwebtoken");
const Users = require("../models/userSchema");

const secretKey = process.env.SECRET_KEY;

const authenticate = async(req, res, next) => {
  try {
    const token = req.header("Authorization");
    //console.log(token);
    const getUserId = jwt.verify(token, secretKey);

    await Users.findById(getUserId.UserId)
      .then((user) => {
        //
        req.user = user;

        next();
      })
      .catch((err) => {
        throw new Error(err);
      });
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ success: false, message: "cant authenticate user" });
  }
};

module.exports = authenticate;
