'use strict';

module.exports = function(app) {
  const { forumCategory } = app.models;
  const { UserAccount } = app.models;

  const categories = [
    "Python",
    "Java",
    "Web",
    "AI",
    "Robotics",
    "Others"
  ];

  let populateCategories = async () =>  {
    for (let i = 0; i < categories.length; i++) {
      forumCategory.findOrCreate({where: {category: categories[i]}}, {category: categories[i]})
      .then(res => {
        console.log("categori item added.");
      })
      .catch(err => {
        console.log(err);
      })

    }
  };

  populateCategories();
};
