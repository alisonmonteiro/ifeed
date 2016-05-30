# ifeed
> Instagram feed on your website. No jquery. Only 2kb gzipped!

## Usage
```javascript
var opts = {
  resolution: 'thumbnail',
  get: 'user',
  userId: YOUR_USER_ID,
  accessToken: 'YOUR_ACCESS_TOKEN',
  sortBy: 'least-liked'
};

document
  .getElementById('ifeed')
  .ifeed(opts);
```
Default options:
```javascript
{
  get: 'popular', // popular, tagged, location, user
  tagName: null,  // for get === tagged
  locationId: null,  // for get === location
  userId: null,  // for get === user
  accessToken: null,  // for get === user
  resolution: 'thumbnail', // thumbnail - 150x150, low - 306x306, standard - 612x612
  sortBy: 'recent', // random, recent, least-recent, most-liked, least-liked, most-commented, least-commented
  limit: 9,
  template: '<a target="_blank" href="{{link}}"><img src="{{image}}" />{{likes}}</a>',
  before: null, // Callback
  after: null // Callback
}
```


## Useful:

1. [Get your instagram userId](http://jelled.com/instagram/lookup-user-id)
1. [Get your instagram accessToken](http://jelled.com/instagram/access-token)
