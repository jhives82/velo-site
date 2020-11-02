import React from 'react'

interface ModalTitleProps {
  children?: any,
  classes?: any,
}

const ModalTitle: React.FC<ModalTitleProps> = ({
  children,
  classes
}) => {
  return (
    <div className="
      my-2 letter-spacing-velo text-shadow-velo
    ">
      {children}
    </div>
  )
}

export default ModalTitle
