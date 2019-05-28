import React from 'react'
import { Link } from 'gatsby'
import { GitHubIcon } from '../social-share/github-icon'
import LOGO from '../../../content/assets/logo.png'

import './index.scss'

export const Top = ({ title, location, rootPath }) => {
  const isRoot = location.pathname === rootPath
  return (
    <div className="top">
      {!isRoot && (
        <Link to={`/`} className="link">
          <img className="logo" width="30" height="30" src={LOGO} alt="logo" />
          <span>{title}</span>
        </Link>
      )}
      <GitHubIcon />
    </div>
  )
}
