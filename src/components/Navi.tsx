import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import React, { Component } from 'react';

const Header = styled(motion.h2)`
  text-transform: uppercase;
  text-decoration: none;
  text-align: right;
  margin: 0 2rem 0 0;
`;

const ButtonContainer = styled(motion.div)`
  display: flex;
  align-items: center;
`;

const MenuButton = styled(motion.button)`
  display: inline-block;
  height: 5em;
  width: 7em;
  padding: 0;
  margin: 0 0 0 25px;
  color: #555;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  line-height: 38px;
  letter-spacing: 0.1rem;
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;
  background-color: transparent;
  border-radius: 4px;
  border: 1px solid #bbb;
  cursor: pointer;
  box-sizing: border-box;
`;

const Navbar = styled(motion.div)`
  width: 300px;
  height: 100%;
  background-color: rgb(239, 245, 245);
  position: absolute;
  top: 50%;
  left: 0;
  transform: translate(-50%, -50%);
  z-index: 1;
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
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
    line-height: 38px;
    text-decoration: none;
  }
`;

const modalVariant = {
  initial: { opacity: 0 },
  isOpen: { opacity: 1 },
  exit: { opacity: 0 },
};

const navbarVariant = {
  initial: { left: '-300px' },
  isOpen: { left: '150px' },
  exit: { left: '-300px' },
};

const buttonVariants = {
  tap: { scale: 0.9 },
  hover: { scale: 1.1 },
};

const links = [
  { name: 'Home', path: '/' },
  { name: 'Summary', path: '/summary' },
  { name: 'Settings', path: '/settings' },
];

interface NaviProps {
  message: string;
}

interface NaviState {
  openState: boolean;
}

// eslint-disable-next-line react/prefer-stateless-function
class Navi extends Component<NaviProps, NaviState> {
  constructor(props: NaviProps) {
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
    const { message } = this.props;
    return (
      <div className="row" style={{ marginTop: '25px' }}>
        <div className="two columns">
          <AnimatePresence>
            <ButtonContainer>
              <MenuButton
                type="button"
                onClick={this.toggleNavi}
                whileTap="tap"
                whileHover="hover"
                variants={buttonVariants}
              >
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
              </MenuButton>
            </ButtonContainer>

            {openState ? (
              <div>
                <Overlay
                  initial="initial"
                  animate="isOpen"
                  exit="exit"
                  variants={modalVariant}
                  onClick={this.toggleNavi}
                />
                <Navbar
                  initial="initial"
                  animate="isOpen"
                  exit="exit"
                  variants={navbarVariant}
                >
                  <div className="" id="modal">
                    <div className="contents" style={{ marginTop: '25%' }}>
                      <LinkList>
                        {links.map((link, index) => (
                          <li>
                            <NavLink key={link.name + link.path} to={link.path}>
                              <h6>{link.name}</h6>
                            </NavLink>
                          </li>
                        ))}
                      </LinkList>
                      <div />
                    </div>
                  </div>
                </Navbar>
              </div>
            ) : null}
          </AnimatePresence>
        </div>
        <div className="ten columns">
          <Header>{message}</Header>
        </div>
      </div>
    );
  }
}

export default Navi;
