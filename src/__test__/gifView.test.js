import React from 'react'
import renderer from 'react-test-renderer';
import ReactDOM from 'react-dom'

import GIFView, { tabs } from '../gifView'
import { configure, shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import { Modal, Label, Image, Message, Loader, Dimmer, Container, Input, Menu, Segment } from 'semantic-ui-react'

configure({ adapter: new Adapter() })

// GIFView tests
it ('renders GIFView without crashing', () => {
    shallow(<GIFView />);

})

fit ('renders view', () => {
    const wrapper = shallow(<GIFView />)

    let topMenu = wrapper.find('Menu').get(0);
    let topMenuProps = topMenu.props;
    let bottomMenu = wrapper.find('Segment').get(0);
    let bottomMenuProps = bottomMenu.props;

    expect(topMenuProps.attached).toEqual("top");
    expect(topMenuProps.children[0].props.name).toEqual(tabs.Search);
    expect(topMenuProps.children[1].props.name).toEqual(tabs.Favorites);
    expect(topMenuProps.children[2].props.position).toEqual("right");
    expect(topMenuProps.children[2].props.children.props.id).toEqual("searchBar");
    
    expect(bottomMenuProps.attached).toEqual("bottom")
    

})
// it('render GIFView', () => {
//     const component = renderer.create(<GIFView />);
//     const tree = component.toJSON();
//     expect(tree).toMatchSnapshot();

//     tree.onTabClick(null, { name: tabs.Favorites });
//     tree = component.toJSON();
//     expect(tree).toMatchSnapshot();
// })





