import React from 'react'

import './Block.css';

interface BlockProps {
  children: any,
  classes?: string,
  style?: object
}

const Block: React.FC<BlockProps> = ({ children, classes, style }) => {
  return (
    <section
      className={`Block px-4 py-2 my-2 mx-1 ${classes}`}
      style={style}
      >
      {children}
    </section>
  )
}

export default Block
