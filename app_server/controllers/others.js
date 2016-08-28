/* GET 'about' page */
module.exports.about = function(req, res) {
  res.render('generic-text', {
    title: 'Aboout Loc8r',
    content: 'Loc8r was created to help people find places to sit down and get a bit of work done.\n\nYou’ll probably want to add some additional lines in there, so that the page looks like it has real content. Notice that the lines starting with the pipe character (|) can contain HTML tags if you want them to. Figure 4.13 shows how this might look in the browser with a bit more content in it.\n\nAnd that’s the last one of the four pages we need for the static site. You can now push this up to Heroku and have people visit the URL and click around. If you’ve forgotten how to do this, the following code snippet shows the terminal commands you need, assuming you’ve already set up Heroku. In terminal, you need to be in the root folder of the application.'
  });
};
