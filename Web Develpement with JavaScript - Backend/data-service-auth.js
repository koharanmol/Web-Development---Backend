const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var exports = (module.exports = {});

const userSchema = new Schema({
  userName: String,
  password: String,
  email: String,
  loginHistory: [{ dateTime: Date, userAgent: String }],
});


userSchema.pre('save', function(next) {
  const user = this;
  if (!user.isModified('password'))
    return next();
  bcrypt.genSalt(10, (err, salt) => {
    if (err)
      return next(err);
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err)
        return next(err);
      user.password = hash;
      next();
    });
  });
});

let User = mongoose.model('User', userSchema);

exports.initialize = () => {
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection(process.env.DB_CONNECTION_STRING);
    db.on('error', (err) => {
      reject(err);
    });
    db.once('open', () => {
      User = db.model('users', userSchema);
      resolve();
    })
  });
}


exports.registerUser = (userData) => {
  return new Promise((resolve, reject) => {
    if (userData.password !== userData.password2)
      reject('Passwords do not match');
    else {
      let newUser = User(userData);
      newUser.save()
        .then(() => {
          resolve();
        })
        .catch(err => {
          if (err.code == 11000)
            reject('user name already taken')
          else if (err.code != 11000)
            reject(`There was an error creating the user: ${err}`);
        });
    }
  });
}

exports.checkUser = (userData) => {
  console.log(userData)
  return new Promise((resolve, reject) => {
    User.find({ userName: userData.userName })
      .then(users => {
        bcrypt.compare(userData.password, users[0].password)
          .then((res) => {
            users[0].loginHistory.push({ dateTime: (new Date()).toString(), userAgent: userData.userAgent });
            User.update({ userName: users[0].userName },
              { $set: { loginHistory: users[0].loginHistory } },
              { multi: false })
              .exec()
              .then(() => {
                resolve(users[0]);
              })
              .catch((err) => {
                reject(`There was an error verifying the user: ${err}`);
              });
          })
          .catch((err) => {
            reject(`Incorrect Password for user: ${userData.userName}`);
          })
      })
      .catch(err => {
        reject(`Unable to find user: ${userData.userName}`);
      })
  });
}