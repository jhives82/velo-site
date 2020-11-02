import React from 'react'

import './Button.css';

interface ButtonProps {
  children?: any,
  disabled?: any,
  full?: any,
  variant?: string,
  classes?: string,
  onClick?: any
}

const Button: React.FC<ButtonProps> = ({
  children,
  disabled,
  classes,
  onClick
}) => {
  return (
    <button
      className={`Button ${classes}`}
      disabled={disabled}
      onClick={onClick}
      >
      {children}
    </button>
  )
}

export default Button
