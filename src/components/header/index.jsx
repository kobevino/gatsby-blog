import React from 'react'
import { Link } from 'gatsby'
import LOGO from '../../../content/assets/logo.png'

import './index.scss'

export const Header = ({ title, location, rootPath }) => {
  const isRoot = location.pathname === rootPath
  return (
    isRoot && (
      <h1 className="home-header">
        <Link to={`/`} className="link">
          <img className="logo" width="50" height="50" src={LOGO} alt="logo" />
          <span>{title}</span>
        </Link>
      </h1>
    )
  )
}
