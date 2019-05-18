import React, { useEffect } from 'react'

export const GoogleAdsense = () => {
  useEffect(() => {
    ;(window.adsbygoogle = window.adsbygoogle || []).push({})
  }, [])

  return (
    <div
      className="google-adsense"
      style={{ marginTop: '20px', height: '60px' }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3546887837495101"
        data-ad-slot="6861569823"
        data-ad-format="auto"
      />
    </div>
  )
}
