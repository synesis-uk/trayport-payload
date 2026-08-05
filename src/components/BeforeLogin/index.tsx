import React from 'react'

const BeforeLogin: React.FC = () => {
  return (
    <section className="trayport-admin-login-intro" aria-labelledby="trayport-login-title">
      <p className="trayport-admin-eyebrow">Trayport website</p>
      <h1 id="trayport-login-title">Content management</h1>
      <p>Sign in with an editor or administrator account to manage website content.</p>
      <p className="trayport-admin-login-intro__note">
        Customer identities are managed separately and cannot sign in here.
      </p>
    </section>
  )
}

export default BeforeLogin
