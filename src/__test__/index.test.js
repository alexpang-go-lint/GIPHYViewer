import React from 'react'

import ReactDOM from 'react-dom'

import { MainView } from '../index'

jest.mock('react-dom', ()=> ({render: jest.fn()}))

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<MainView />, div);
    global.document.getElementById = (id) => id ==='root' && div
    expect(ReactDOM.render).toHaveBeenCalledWith(<MainView />, div);
});