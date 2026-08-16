const fs = require('fs');
const w = 2000;
const h = 2000;
function generateStars(n) {
  let stars = [];
  for(let i=0; i<n; i++) {
    stars.push(Math.floor(Math.random()*w) + 'px ' + Math.floor(Math.random()*h) + 'px #FFF');
  }
  return stars.join(', ');
}
let css = `
.stars-small { width: 1px; height: 1px; background: transparent; box-shadow: ${generateStars(700)}; animation: animStar 50s linear infinite; }
.stars-small:after { content: ' '; position: absolute; top: 2000px; width: 1px; height: 1px; background: transparent; box-shadow: ${generateStars(700)}; }
.stars-medium { width: 2px; height: 2px; background: transparent; box-shadow: ${generateStars(200)}; animation: animStar 100s linear infinite; }
.stars-medium:after { content: ' '; position: absolute; top: 2000px; width: 2px; height: 2px; background: transparent; box-shadow: ${generateStars(200)}; }
.stars-large { width: 3px; height: 3px; background: transparent; box-shadow: ${generateStars(50)}; animation: animStar 150s linear infinite; }
.stars-large:after { content: ' '; position: absolute; top: 2000px; width: 3px; height: 3px; background: transparent; box-shadow: ${generateStars(50)}; }
@keyframes animStar { from { transform: translateY(0px); } to { transform: translateY(-2000px); } }
`;
fs.writeFileSync('src/stars.css', css);
