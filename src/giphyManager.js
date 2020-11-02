/**
 * Manages communication to GIPHY API and stores favorites in localStorage
 */
var giphyManager = function() {
  this.localStorageKey = "GIPHYViewer_Favorites";
  this.apiKey = `zXR3N530eDGXASbVxeR04jqwGKCiPaEO`;
  this.count = 20; // render 20 at a time
  
  this.onSuccess = function(res, callback) {
    if (typeof callback === "function") {
      callback(res);
    }
  }

  this.onError = function(err, callback) {
    alert("Error fetching from GIPHY");
    
    if (typeof callback === "function") {
      callback(null);
    }
  }

  this.xhr = function(url, callback) {
    let that = this;

    let r = new XMLHttpRequest();
    r.open('GET', url, true);

    r.onload = function() {
      let response = JSON.parse(this.response);
      if (this.status >= 200 && this.status < 400) {
        that.onSuccess(response, callback);
      } else {
        that.onError(response, callback);
      }
    }

    r.onerror = function() {
      that.onError("An error occurred during the request", callback)
    }

    r.send()
  }
};

/**
 * Get trending Endpoint from GIPHY API
 * @param {Int32} offset Specifies the starting position of the results.
 * @param {function} callback on success, includes a response from the API as an argument, null if error
 */
giphyManager.prototype.getTrending = function(offset, callback) {
  let url = `http://api.giphy.com/v1/gifs/trending?api_key=${this.apiKey}&limit=${this.count}&offset=${offset}`
  this.xhr(url, callback);
}

/**
 * Get search endpoint from GIPHY API
 * @param {string} searchTerm search term for the query
 * @param {Int32} offset start position of the results
 * @param {function} callback on success, includes a response from the API as an argument, null if error
 */
giphyManager.prototype.searchGIF = function(searchTerm, offset, callback) {
  let url = `http://api.giphy.com/v1/gifs/search?q=${searchTerm}&api_key=${this.apiKey}&limit=${this.count}&rating=pg&offset=${offset}`;
  this.xhr(url, callback);
}

/**
 * Get GIFs by ID endpoint from GIPHY API
 * @param {Array} ids array of all the ids to get
 * @param {function} callback on success, includes a response from the API as an argument, null if error
 */
giphyManager.prototype.getGIFs = function(ids, callback) {
  let that = this;
  let idQuery = "";
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    idQuery += id;
    if (i < ids.length - 1) {
      idQuery += ','
    }
  }
  let url = `http://api.giphy.com/v1/gifs?api_key=${this.apiKey}&ids=${idQuery}`

  this.xhr(url, callback);
}

/**
 * Toggles the id in the favorite list
 * @param {string} id gif id obtained from the GIPHY API
 */
giphyManager.prototype.toggleFavorite = function(id) {
  let favs = this.getFavoritesList();
  if (favs.includes(id)) {
    favs = favs.filter(fav => fav !== id);
  } else {
    favs.push(id);
  }

  if (favs.length === 0) {
    localStorage.removeItem(this.localStorageKey);
  } else {
    localStorage.setItem(this.localStorageKey, JSON.stringify(favs));
  }
}

/**
 * Get GIFs by favorites
 * @param {function} callback on success, includes a response from the API as an argument, null if error or no favorites
 */
giphyManager.prototype.getFavorites = function(callback) {
  let favs = this.getFavoritesList();
  if (favs.length > 0) {
    this.getGIFs(favs, callback);
  } else {
    callback(null);
  }
}

/**
 * Get the ids of the favorites as an array. Empty array if no favorites
 */
giphyManager.prototype.getFavoritesList = function() {
  let item = JSON.parse(localStorage.getItem(this.localStorageKey)) || [];
  
  if (Array.isArray(item)) {
    return item;
  } else {
    return [item];
  }
}

export default giphyManager
