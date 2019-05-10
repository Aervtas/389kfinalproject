
# PROJECT NAME

---

Name: Kevin Lin, Atul Bharati, Abiy Asfaw

Date: 5-10-2019

Project Topic: Game and Music Reviews

URL: https://t389kfinalproject.herokuapp.com/

---


### 1. Data Format and Storage

Data point fields:
- `Field 1`: title       `Type: String'
- `Field 2`: year       `Type: Number'
- `Field 3`: genre       `Type: [String]`
- `Field 4`: company       `Type: String`
- `Field 5`: reviews       `Type: [reviewSchema]`
- `Field 6`: composer       `Type: String`
- `Field 7`: rating       `Type: Number`
- `Field 8`: comment       `Type: String`
- `Field 9`: author       `Type: String`

Schema:
```Model
Game {
  title: String,
  year: Number,
  genre: [String],
  company: String,
  reviews: [reviewSchema]
}
Music {
  title: String,
  year: Number,
  genre: [String],
  composer: String,
  reviews: [reviewSchema]
}
Review {
  rating: Number,
  comment: String,
  author: String
}
```

### 2. Add New Data

HTML form route: `/game`

POST endpoint route: `/game`

Example Node.js POST request to endpoint:
```javascript
var request = require("request");

var options = {
    method: 'POST',
    url: 'http://localhost:3000/game',
    headers: {
        'content-type': 'application/x-www-form-urlencoded'
    },
    form: {
       title: 'Minesweeper',
       year: 1950,
       genre: ['speedrun', 'blindfold', 'russian roulette'],
       company: 'Somebody',
       reviews: []
    }
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
```

### 3. View Data

GET endpoint route: `/api/gamereviews`

### 4. Search Data

Search Field: title

### 5. Navigation Pages

Navigation Filters
1. most reviewed game -> `  /game/greatest  `
2. most reviewed music -> `  /music/greatest  `
3. highest rated game -> `  /game/best  `
4. highest rate music -> `  /music/best  `
5. random music -> `  /music/random  `
