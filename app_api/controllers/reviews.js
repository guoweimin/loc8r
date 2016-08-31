var mongoose = require('mongoose');
var Loc = mongoose.model('Location');
var User = mongoose.model('User');

var sendJSONResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

var updateAverageRating = function(locationid) {
  Loc.findById(locationid)
  .select('rating reviews')
  .exec(function(err, location) {
    if(!err) {
      doSetAverageRating(location);
    }
  });
};

var doSetAverageRating = function(location) {
  var i, reviewCount, ratingAverage, ratingTotal = 0;
  if(location.reviews && location.reviews.length > 0) {
    reviewCount = location.reviews.length;
    for(var i = 0; i < reviewCount; i++) {
      ratingTotal += location.reviews[i].rating;
    }
    ratingAverage = parseInt(ratingTotal / reviewCount, 10);
    location.rating = ratingAverage;
    location.save(function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("Average rating placed to ", ratingAverage);
      }
    });
  } else {
    location.rating = 0;
    location.save(function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("Average rating reset to 0");
      }
    });
  }
};

module.exports.reviewsCreate = function(req, res) {
  getAuthor(req, res, function(req, res, userName) {
    if(req.params.locationid) {
      Loc.findById(req.params.locationid)
      .select('reviews')
      .exec(function(err, location) {
        if(err) {
          sendJSONResponse(res, 400, err);
        } else {
          doAddReview(req, res, location, userName);
        }
      });
    } else {
      sendJSONResponse(res, 404, {
        "message": "Not found, locationid required"
      });
    }
  });
};

var getAuthor = function(req, res, callback) {
  if(req.payload && req.payload.email) {
    User
      .findOne({ email : req.payload.email })
      .exec(function(err, user) {
        if(!user) {
          sendJSONResponse(res, 404, {
            "message": "User not found"
          });
          return;
        } else if(err) {
          console.log(err);
          sendJSONResponse(res, 404, err);
          return;
        }
        callback(req, res, user.name);
      });
  } else {
    sendJSONResponse(res, 404, {
      "message": "User not found"
    });
    return;
  }
};

var doAddReview = function(req, res, location, author) {
  if(!location) {
    sendJSONResponse(res, 404, {
      "message": "locationid not found"
    });
  } else {
    location.reviews.push({
      author: author,
      rating: req.body.rating,
      reviewText: req.body.reviewText
    });
    location.save(function(err, location) {
      var thisReview;
      if(err) {
        console.log(err);
        sendJSONResponse(res, 400, err);
      } else {
        updateAverageRating(location._id);
        thisReview = location.reviews[location.reviews.length - 1];
        sendJSONResponse(res, 201, thisReview);
      }
    });
  }
};

module.exports.reviewsReadOne = function(req, res) {
  if(req.params && req.params.locationid && req.params.reviewid) {
    Loc.findById(req.params.locationid)
    .select('name reviews')
    .exec(function(err, location) {
      var response, review;
      if(!location) {
        sendJSONResponse(res, 404, {
          "message": "locationid not found"
        });
        return;
      } else if(err) {
        sendJSONResponse(res, 404, err);
        return;
      }
      if(location.reviews && location.reviews.length > 0) {
        //console.log(location.reviews);
        review = location.reviews.id(req.params.reviewid);
        if(!review) {
          sendJSONResponse(res, 404, {
            "message": "reviewid not found",
          });
        } else {
          response = {
            location: {
              name: location.name,
              id: req.params.locationid
            },
            review : review
          };
          sendJSONResponse(res, 200, response);
        }
      } else {
        sendJSONResponse(res, 404, {
          "message" : "No reviews found"
        });
      }
    });
  } else {
    sendJSONResponse(res, 404, {
      "message": "No locationid in request"
    });
  }
};

module.exports.reviewsUpdateOne = function(req, res) {
  if(!req.params.locationid || !req.params.reviewid) {
    sendJSONResponse(res, 404, {
      "message": "Not found, locationid and reviewid are both required"
    });
    return;
  }
  Loc.findById(req.params.locationid)
  .select('reviews')
  .exec(function(err, location) {
    var thisReview;
    if(!location) {
      sendJSONResponse(res, 404, {
        "message": "locationid not found"
      });
      return;
    } else if (err) {
      sendJSONResponse(res, 400, err);
      return;
    }
    if(location.reviews && location.reviews.length > 0) {
      thisReview = location.reviews.id(req.params.reviewid);
      if(!thisReview) {
        sendJSONResponse(res, 404, {
          "message": "reviewid not found"
        });
      } else {
        thisReview.author = req.body.author;
        thisReview.rating = req.body.rating;
        thisReview.reviewText = req.body.reviewText;
        location.save(function(err, loaction) {
          if(err) {
            sendJSONResponse(res, 400, err);
          } else {
            updateAverageRating(location._id);
            sendJSONResponse(res, 200, thisReview);
          }
        });
      }
    }
  });
};

module.exports.reviewsDeleteOne = function(req, res) {
  if(!req.params.locationid || !req.params.reviewid) {
    sendJSONResponse(res, 404, {
      "message": "Not found, locationid and reviewid are both required"
    });
    return;
  }
  Loc.findById(req.params.locationid)
  .select('reviews')
  .exec(function(err, location) {
    if(!location) {
      sendJSONResponse(res, 404, {
        "message": "locationid not found"
      });
      return;
    } else if(err) {
      sendJSONResponse(res, 400, err);
      return;
    }
    if(location.reviews && location.revidews.length > 0) {
      if(!location.reviews.id(req.params.reviewid)) {
        sendJSONResponse(res, 404, {
          "message": "reviewid not found"
        });
      } else {
        lcoation.reviews.id(req.params.reviewid).remove();
        location.save(function(err) {
          if(err) {
            sendJSONResponse(res, 400, err);
          } else {
            updateAverageRating(location._id);
            sendJSONResponse(res, 204, null);
          }
        });
      }
    }
  });
};
