var data = require('./grimoires.json');

var selectedGrimoire = data[rand(0,data.length - 1)].props;
console.log(selectedGrimoire);

var excerptsUrl = "https://www.grimoire.org/api/v1/node/" + selectedGrimoire.uid + "/excerpt";



function rand(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}