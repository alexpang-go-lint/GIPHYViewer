// GIPHY API tests
import giphyManager from '../giphyManager'



var manager = new giphyManager();
let open, send, status, onload, onerror, setRequestHeader, response;
let originalJSONParse = JSON.parse;

function createXHRmock(testOnError) {
    open = jest.fn().mockImplementation(function(request, url, async) {
        // console.log("open called with: " + request + ", " + url + ", " + async)
    });
    status = 200;
    response = "aaaaaa";
    window.alert = () => {};
    send = jest.fn().mockImplementation(function() {
        onload = this.onload.bind(this);
        onerror = this.onerror.bind(this);

        if (testOnError) {
            onerror(response);
        } else {
            onload(response);
        }
    });


    const xhrMockClass = function () {
        return {
            open,
            send,
            status,
            setRequestHeader,
            response
        };
    };

    window.XMLHttpRequest = jest.fn().mockImplementation(xhrMockClass);
}


function createJSONMockOnce() {
    JSON.parse = jest.fn().mockImplementationOnce(function(arg) {
        return [ response ];
    })
}

it('test constructor', () => {
    let localStorageKey = "GIPHYViewer_Favorites";
    let apiKey = `zXR3N530eDGXASbVxeR04jqwGKCiPaEO`;
    let count = 20; // render 20 at a time
  
    expect(manager.localStorageKey).toEqual(localStorageKey);
    expect(manager.apiKey).toEqual(apiKey);
    expect(manager.count).toEqual(count);
});

it('test trending endpoint', done => {
    let url = `http://api.giphy.com/v1/gifs/trending?api_key=${manager.apiKey}&limit=${manager.count}&offset=0`

    createXHRmock();

    createJSONMockOnce();

    manager.getTrending(0, (response) => {
        // expect(response.data.length).toEqual(20);
        expect(open).toBeCalledWith('GET', url, true);
        expect(send).toBeCalled();
        done();
    });
})

it('test search endpoint', done => {
    let url = `http://api.giphy.com/v1/gifs/search?q=a&api_key=${manager.apiKey}&limit=${manager.count}&rating=pg&offset=0`;

    createXHRmock();
    createJSONMockOnce();

    manager.searchGIF("a", 0, (response) => {
        // expect(response.data.length).toEqual(20);

        expect(open).toBeCalledWith('GET', url, true);
        expect(send).toBeCalled();
        done();
    });
})

it('test get endpoint', done => {
    let ids = ['a', 'b'];
    
    let idQuery = "";
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        idQuery += id;
        if (i < ids.length - 1) {
        idQuery += ','
        }
    }
    let url = `http://api.giphy.com/v1/gifs?api_key=${manager.apiKey}&ids=${idQuery}`

    createXHRmock();
    createJSONMockOnce();

    manager.getGIFs(ids, (res) => {
        // expect(getRes.data.length).toEqual(20);
        expect(open).toBeCalledWith('GET', url, true);
        expect(send).toBeCalled();
        done();

    })
    
})

it('test get favs', done => {
    createXHRmock();

    // Test multiple favs
    let a = 'aaaaaa', b = 'bbbbb';
    JSON.parse = jest.fn().mockImplementationOnce(function(arg) {
        return [a, b]
    })
    
    let url = `http://api.giphy.com/v1/gifs?api_key=${manager.apiKey}&ids=${a},${b}`

    manager.getFavorites((res) => {
        expect(open).toBeCalledWith("GET", url, true)
        expect(send).toBeCalled();

        // Test 1 fav
        JSON.parse = jest.fn().mockImplementationOnce(function(arg) {
            return [a]
        })
        
        url = `http://api.giphy.com/v1/gifs?api_key=${manager.apiKey}&ids=${a}`

        manager.getFavorites((res) => {
            expect(open).toBeCalledWith("GET", url, true);
            expect(send).toBeCalled();

            // Test no favs
            JSON.parse = jest.fn().mockImplementationOnce(function(arg) {
                return null;
            })

            manager.getFavorites((res) => {
                expect(res).toBeNull();
                done();
            })
        })

    })
})

it('test toggle fav', () => {
    JSON.parse = originalJSONParse;

    let a = 'aaaaaa';
    
    // case: localStorage has same item
    localStorage.setItem(manager.localStorageKey, JSON.stringify(a));
    
    manager.toggleFavorite(a);

    // Should be removed
    expect(localStorage.getItem(manager.localStorageKey)).toBeNull();

    // case: localStorage does not have the item
    manager.toggleFavorite(a);

    let item = manager.getFavoritesList();
    expect(item.length).toEqual(1);
    expect(item[0]).toEqual(a);
    
})

it('test on error', done => {
    createXHRmock(true);

    manager.getTrending(0, (res) => {
        expect(res).toBeNull();
        done();
    })
})

it('test bad status', done => {
    createXHRmock();

    send = jest.fn().mockImplementation(function() {
        onload = this.onload.bind(this);
        onerror = this.onerror.bind(this);

        this.status = 400;
        onload(response);
    });

    JSON.parse = jest.fn().mockImplementation(function(arg) {
        return null;
    })

    manager.getTrending(0, (res) => {
        expect(res).toBeNull();
        done();
    })
})