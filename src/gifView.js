import React from 'react'
import ReactDOM from 'react-dom'

import { Modal, Label, Image, Message, Loader, Dimmer, Container, Input, Menu, Segment } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

import { Row, Col } from 'react-bootstrap';

import giphyManager from './giphyManager'

const manager = new giphyManager();
 
const tabs = {
  Search: "Search",
  Favorites: "Favorites"
}
export { tabs };

const initialState = {
  activeTab: tabs.Search,
  res: null,
  noResultMsgBody: "",
  noResultMsgHeader: "",
  favs: []
}

// Also handles the menu tab operations
export default class GIFView extends React.Component {
  constructor(props) {
    super(props);
    
    this.tabs = tabs;

    this.state = initialState;

    // on search change, wait 300 ms before updating view
    this.timeoutMS = this.props.timeout || 300;

    this.isRendering = false;
    this.totalCount = 0; // total gifs rendered

  }

  onStartRender() {
    let overlay = document.getElementById("loadingOverlay");
    if (overlay) {
      overlay.classList.add("active");
    }
    
    this.isRendering = true;
  }

  onCompleteRender() {
    let overlay = document.getElementById("loadingOverlay")
    if (overlay) {
      overlay.classList.remove("active");
    }
    this.isRendering = false;
  }

  appendGIFSToState(response) {
    if (this.state.res) {
      response.data = this.state.res.data.concat(response.data);
      this.setState({ res: response });
    }
  }

  /**
   * Renders trending results from GIPHY to the view
   * @param {bool} isAppend whether rendering new GIFs will append to the list, false will replace all existing GIFs
   */
  renderTrending(isAppend = false) {
    this.onStartRender();

    manager.getTrending(isAppend ? this.totalCount : 0, (response) => { 
      if (isAppend) {
        this.appendGIFSToState(response);
      } else {
        this.setState({ res: response, favs: manager.getFavoritesList() });
      }
      
    });
  }

  /**
   * Renders search results from GIPHY to the view
   * @param {string} searchTerm 
   * @param {bool} isAppend whether rendering new GIFs will append to the list, false will replace all existing GIFs
   */
  renderSearch(searchTerm, isAppend = false) {
    this.onStartRender();

    manager.searchGIF(searchTerm, isAppend ? this.totalCount : 0, (response) => {
      if (isAppend) {
        this.appendGIFSToState(response);
      } else {
        this.setState({ res: response });
      }
      
    });
  }

  /**
   * Renders favorites to the view
   */
  renderFavorites() {
    this.onStartRender();

    manager.getFavorites((response) => {
      if (response) {
        // Simply renders all of the favorites without pagination
        this.setState({ res: response })
      } else {
        this.setState({ 
          res: null, 
          noResultMsgHeader: "Oops",
          noResultMsgBody: "No favorites! Start clicking the ⭐ button on the GIFS!" });
      }
    });
  }

  componentDidMount() {
    window.onscroll = this.onScroll;
    window.onresize = this.onResize;
    this.mounted = true;
    this.renderTrending();
  }

  isScrollToBottom() {
    return document.getElementById("view").getBoundingClientRect().bottom <= window.innerHeight;
  }
  onResize = () => {
    this.forceUpdate();
  }
  onScroll = () => {
    if (!this.isRendering && this.isScrollToBottom()) {
      // Append more GIFS to the view
      let searchBar = document.getElementById("searchBar");
      if (searchBar) {
        let searchTerm = searchBar.value;
        
        if (searchTerm.length === 0) {
          this.renderTrending(true);
        } else {
          this.renderSearch(searchTerm, true);
        }
      }
      
    }
  }

  onTabClick = (e, { name }) => {
    this.setState({ activeTab: name }, () => {
      switch (name) {
        case this.tabs.Search:
          let searchBar = document.getElementById("searchBar");
          if (searchBar) {
            let searchTerm = searchBar.value;
            
            if (searchTerm.length === 0) {
              this.renderTrending();
            } else {
              this.renderSearch(searchTerm);
            }
          }
          
          break;
        case this.tabs.Favorites:
          this.renderFavorites();
          break;
        default:
          break;
      }    
    })

  }

  onSearchChange = (e) => {
    // Only perform the search after a timeout

    clearTimeout(this.timeoutRef);
    this.timeoutRef = setTimeout(() => {
      let searchTerm = e.target.value;
      
      switch (this.state.activeTab) {
        case this.tabs.Search:
          if (searchTerm.length === 0) {
            this.renderTrending();
          } else {
            this.renderSearch(searchTerm);
          }
          break;
        case this.tabs.Favorites:
          // Search favorites
          break;
        default:
          break;
      }
    }, this.timeoutMS)
  }

  onToggleFavorite = (e, gifID) => {
    manager.toggleFavorite(gifID);

    // Rerender
    if (this.state.activeTab === this.tabs.Favorites) {
      this.renderFavorites();
    } else {
      this.setState({ favs: manager.getFavoritesList() })
    }
  }

  copyLink = (e, imageURL, index) => {
    // Copy the link to clipboard
    let t = document.createElement("textarea");    
    t.value = imageURL;
    
    // Hide the textbox
    t.style.position = 'fixed';
    t.style.top = 0;
    t.style.left = 0;
    t.style.width = '2em';
    t.style.height = '2em';
    t.style.padding = 0;
    t.style.border = 'none';
    t.style.outline = 'none';
    t.style.boxShadow = 'none';
    t.style.background = 'transparent';

    // Copy its contents
    let copier = document.getElementById("copier")
    copier.appendChild(t);
    t.focus();
    t.select();
  
    let successful = document.execCommand('copy');
  
    copier.removeChild(t);

    // Show dimmer on image
    this.setState({ imageDimmer: index, imageDimmerLabel: successful ? "Link Copied!" : "Error!"})

    clearTimeout(this.timeoutRef);
    this.timeoutRef = setTimeout(() => {
      this.setState({ imageDimmer: -1})
    }, 1000 )
  }

  openShareModal = (id) => {
    this.setState({ openShareModal: true })
  }

  onShareModalClose = () => {
    this.setState({ openShareModal: false })
  }

  /**
   * Render GIFS given a response from the GIPHY API
   * @param {Options object} options parameters
   * @param {GIF Object} options.res response from using the GIPHY API
   * @param {bool} options.noResult whether options.res has any result, is no results, will output a message
   * @param {string} options.noResultMsgHeader header for the message when there are no results
   * @param {string} options.noResultMsgBody body for the message when there are no results
   */
  renderGIFS = function(options) { // in this case, options is just this.state
    let that = this;

    let res = options.res;
    let noResult = options.noResult || false;
    let noResultMsgHeader = options.noResultMsgHeader || "";
    let noResultMsgBody = options.noResultMsgBody || "No results.";
    let favs = options.favs;

    let container = document.getElementById("view");

    if (noResult || !res || res.data.length === 0) {
      // No results
      // Output a no-result message 
      this.onCompleteRender();
      if (container) {
        container.style.height = null;
      }
      
      return (
        <Message className="mx-3" error={noResult}>
          <Message.Header content={noResultMsgHeader} />
          {noResultMsgBody}
        </Message>
      )
    }
    
    
    let images = [];
    for (let i = 0; i < res.data.length; i++) {
      const g = res.data[i];
      
      let original = g.images.original; // use original for the best resolution
      images.push({ 
        image: original.url, 
        originalW: original.width, 
        originalH: original.height, 
        id: g.id, 
        favorite: favs.includes(g.id) 
      });
    }

    function renderBestFit(images) {
      let buffer = [];

      const imageW = 240; // force all images to have the same width, scale height with its aspect ratio

      const left = 36;
      let columns = 0;
      let maxCols = 4; // max images per row
      let marginRight = 4; // margin in pixels
      let marginBottom = marginRight;
      
      // Find the most suitable # of columns for the respective screen width
      let windowW = window.innerWidth;

      function findBestFit() {
        let accumulatedW = 244;
        let maxW = windowW * 0.7;
        while(accumulatedW < maxW && columns < maxCols) {
          columns++;
          accumulatedW += imageW + marginRight;
        }
      }
      
      findBestFit();

      // Since each gif has its own height, fit the gifs as best as possible to save vertical space
      for (let i = 0; i < images.length; i++) {
        const gif = images[i];
        
        // x of the image is the "right" of the image before it
        // y of the image is the "bottom" of the image in the previous row of the same column
        let posX = i % columns == 0 ? left : images[i - 1].right;
        let posY = i < columns ? 0 : images[i - columns].bottom;

        const aspectRatio = gif.originalW / gif.originalH;
        const imageH = imageW / aspectRatio;
        
        images[i].bottom = posY + imageH + marginBottom; // posY of the image directly beneath it
        images[i].right = posX + imageW + marginRight; // posX of the next image

        const iconName = gif.favorite  ? "star" : "star outline";

        buffer.push(
          <Dimmer.Dimmable key={i} style={{
            position: "absolute", 
            transform: `translate(${posX}px, ${posY}px)`
          }}>
            <Dimmer active={that.state.imageDimmer === i}>
              <Label basic content={that.state.imageDimmerLabel} icon="linkify" size="big"/>
            </Dimmer>
            <Image>
              <img src={gif.image} width={imageW} height={imageH}/>
              <Label 
                as='a'
                color='yellow'
                corner='left'
                icon={iconName}
                size='mini'
                onClick={(e) => that.onToggleFavorite(e, gif.id)}
              />
              <Label 
                as='a'
                color='blue'
                corner='right'
                icon="linkify"
                size='mini'
                onClick={(e) => that.copyLink(e, gif.image, i)}
              />
            </Image>
          </Dimmer.Dimmable>
        )
      }

    
      // Set height of the menu so the borders of the menu precisely fits the view
      // Nothing we can do about the width, however (hardcoded by semantic based on screen width)
      let bottomMost = images[images.length - 1].bottom;
      container.style.setProperty("height", bottomMost + "px");

      return (
        <div style={{position: "relative"}}>
          {buffer}
        </div>
      )
    }

    this.totalCount = images.length;
    
    let view = renderBestFit(images);
    
    this.onCompleteRender();
    return view;
  }


  render() {
    const { activeTab: activeTab } = this.state
    
    return (
      <Container>
        <Menu attached='top' tabular>
          <Menu.Item
            name={this.tabs.Search}
            icon="search"
            active={activeTab === this.tabs.Search }
            onClick={this.onTabClick}
          />
          <Menu.Item
            name={this.tabs.Favorites}
            icon="favorite"
            active={activeTab === this.tabs.Favorites}
            onClick={this.onTabClick}
          />
          <Menu.Menu position='right'>
            { activeTab === this.tabs.Search ?             
              <Input
                className="mr-2"
                id="searchBar"
                transparent
                icon={{ name: 'search', link: true }}
                placeholder='Search GIFS...'
                onChange={this.onSearchChange}
              /> 
              : null
            }
              
          </Menu.Menu>
        </Menu>

        <Segment attached='bottom' style={{padding: "1em 1em"}}>
          <div id="view"> 
            { this.renderGIFS( this.state ) }
          </div>
          
          <Dimmer id="loadingOverlay">
            <Loader />
          </Dimmer>
        </Segment>
        <div id="copier"/>
      </Container>
    )
  }
}
