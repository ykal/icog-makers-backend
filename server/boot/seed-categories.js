'use strict';

module.exports = function(app) {
  const { forumCategory } = app.models;
  const { tag } = app.models;

  const categories = [
    "Python",
    "Java",
    "Web",
    "AI",
    "Robotics",
    "Others"
  ];

  const tags = [
    "PHP",
    "OOP",
    "Node",
    "Machine Learning",
    "Deep Learning"
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

  let populateTags = async () => {
    for (let i = 0; i < tags.length; i++) {
      tag.findOrCreate({where: {name: tags[i]}}, {name: tags[i]})
      .then(res => {
        console.log("Tag item added.");
      })
      .catch(err => {
        console.log(err);
      })
    }
  }

  populateCategories();
  populateTags();
};
