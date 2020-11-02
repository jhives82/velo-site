import React from 'react'

import {
  Modal as ModalNeu
} from 'react-neu'

import './Modal.css';

interface ModalProps {
  children?: any,
  isOpen?: boolean,
  classes?: any,
}

const Modal: React.FC<ModalProps> = ({
  children,
  isOpen
}) => {
  return (
    <div
      className="Modal"
      style={{display: isOpen ? 'flex' : 'none'}}
      >
      <div className="Modal-click-area" />
      <div className="Modal-inner">
        <div className="Modal-content">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
