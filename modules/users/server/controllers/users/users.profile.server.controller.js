'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  Student = mongoose.model('Recruiter'),
  User = mongoose.model('User');

/**
 * Update user details
 */
exports.update = function (req, res) {
  // Init Variables
  var user = req.user;

  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  if (user) {
    // Merge existing user
    user = _.extend(user, req.body);
    user.updated = Date.now();
    user.displayName = user.firstName + ' ' + user.last.lastName;

    user.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        req.login(user, function (err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.json(user);
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};

exports.studentUpdate = function (req, res) {
  console.log(req.body);
  User.findOne({ '_id': req.body._id }, function(err, user) {
    if (err) {
      res.status(400).send('An error occured');
    } else {
      var username = req.body.username;
      Student.findOne({ 'primaryEmail.email' : req.body.primaryEmail.email }, function(err, student){
        if (err) {
          res.status(400).send('An error occured');
        } else if (student === null) {
          console.log("no student found");
        } else {
          student.firstName = req.body.firstName;
          student.last.lastName = req.body.last.lastName;
          student.last.lastNameDontShow = req.body.last.lastNameDontShow;
          student.username = req.body.username;
          student.secondaryEmail.email = req.body.secondaryEmail.email;
          student.secondaryEmail.emailDontShow = req.body.secondaryEmail.emailDontShow;
          student.major.major = req.body.major.major;
          student.major.majorDontShow = req.body.major.majorDontShow;
          student.gradDate.date = req.body.gradDate.date;
          student.gradDate.dateDontShow = req.body.gradDate.dateDontShow;
          student.linkedin.url = req.body.linkedin.url;
          student.linkedin.linkedinDontShow = req.body.linkedin.linkedinDontShow;
          student.projects.subjuGator = req.body.projects.ubjuGator;
          student.projects.propaGator = req.body.projects.propaGator;
          student.projects.naviGator = req.body.projects.naviGator;
          student.save(function (err) {
            if (err) {
              return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
              });
            }
          });
        }

      });

    }
  });


};
/**
 * Update profile picture
 */
exports.changeProfilePicture = function (req, res) {
  var user = req.user;
  var message = null;
  var upload = multer(config.uploads.profileUpload).single('newProfilePicture');
  var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).profileUploadFileFilter;

  // Filtering to upload only images
  upload.fileFilter = profileUploadFileFilter;

  if (user) {
    upload(req, res, function (uploadError) {
      if(uploadError) {
        return res.status(400).send({
          message: 'Error occurred while uploading profile picture'
        });
      } else {
        user.profileImageURL = config.uploads.profileUpload.dest + req.file.filename;

        user.save(function (saveError) {
          if (saveError) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(saveError)
            });
          } else {
            req.login(user, function (err) {
              if (err) {
                res.status(400).send(err);
              } else {
                res.json(user);
              }
            });
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};

/**
 * Send User
 */
exports.me = function (req, res) {
  res.json(req.user || null);
};
