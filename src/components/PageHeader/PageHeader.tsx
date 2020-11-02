import React from 'react'

import { NavLink } from 'react-router-dom'

import './PageHeader.css';

interface PageHeaderProps {
}

const PageHeader: React.FC<PageHeaderProps> = () => {
  return (
    <section className="PageHeader">
      <div className="mt-6">
        <img className="PageHeader-brand" src="/components/PageHeader/20201028/logo.png" alt="VELOTOKEN brand" style={{width: '80px'}} />
        <img className="PageHeader-logo" src="/components/PageHeader/20201028/title.png" alt="VELOTOKEN logo" />
      </div>
    </section>
  )
}

export default PageHeader
