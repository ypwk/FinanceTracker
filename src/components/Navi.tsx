import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import React, { Component } from 'react';

const Navbar = styled(motion.div)`
  width: 20%;
  height: 100%;
  background-color: rgb(239, 245, 245);
  position: absolute;
  top: 50%;
  left: 0;
  transform: translate(-50%, -50%);
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
`;

const LinkList = styled.ul`
  a {
    text-decoration: none;
    color: #555;
  }
  a:hover {
    color: #111;
  }
  li {
    display: block;
    list-style: none;
    width: 100%;
    height: 38px;
    padding: 0 30px;
    font-size: 14px;
    font-weight: 200;
    line-height: 38px;
    letter-spacing: 0.1rem;
    text-transform: uppercase;
    text-decoration: none;
  }
`;

const modalVariant = {
  initial: { opacity: 0 },
  isOpen: { opacity: 1 },
  exit: { opacity: 0 },
};

const navbarVariant = {
  initial: { left: '-50%' },
  isOpen: { left: '10%' },
  exit: { left: '-50%' },
};

const links = [
  { name: 'Home', path: '/' },
  { name: 'Summary', path: '/summary' },
  { name: 'Settings', path: '/settings' },
];

interface NaviState {
  openState: boolean;
}

// eslint-disable-next-line react/prefer-stateless-function
class Navi extends Component<Record<string, never>, NaviState> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      openState: false,
    };

    this.toggleNavi = this.toggleNavi.bind(this);
  }

  toggleNavi() {
    this.setState((prevState) => {
      return {
        openState: !prevState.openState,
      };
    });
  }

  render() {
    const { openState } = this.state;
    return (
      <AnimatePresence>
        <div className="row">
          <button type="button" onClick={this.toggleNavi}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-menu-app"
              viewBox="0 0 16 16"
            >
              <path d="M0 1.5A1.5 1.5 0 0 1 1.5 0h2A1.5 1.5 0 0 1 5 1.5v2A1.5 1.5 0 0 1 3.5 5h-2A1.5 1.5 0 0 1 0 3.5v-2zM1.5 1a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-2zM0 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V8zm1 3v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2H1zm14-1V8a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v2h14zM2 8.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0 4a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z" />
            </svg>
          </button>
          {openState ? (
            <Overlay
              initial="initial"
              animate="isOpen"
              exit="exit"
              variants={modalVariant}
              onClick={this.toggleNavi}
            >
              <Navbar variants={navbarVariant}>
                <div className="" id="modal">
                  <div className="contents" style={{ marginTop: '25%' }}>
                    <LinkList>
                      {links.map((link, index) => (
                        <li>
                          <NavLink key={link.name} to={link.path}>
                            {link.name}
                          </NavLink>
                        </li>
                      ))}
                    </LinkList>
                    <div />
                  </div>
                </div>
              </Navbar>
            </Overlay>
          ) : null}
        </div>
      </AnimatePresence>
    );
  }
}

export default Navi;
