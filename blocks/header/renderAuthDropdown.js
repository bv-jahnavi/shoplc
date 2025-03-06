/* eslint-disable import/prefer-default-export */
import * as authApi from '@dropins/storefront-auth/api.js';
import { render as authRenderer } from '@dropins/storefront-auth/render.js';
import { SignIn } from '@dropins/storefront-auth/containers/SignIn.js';
import { events } from '@dropins/tools/event-bus.js';
import { getCookie } from '../../scripts/configs.js';
import { CUSTOMER_FORGOTPASSWORD_PATH } from '../../scripts/constants.js';
import { rootLink } from '../../scripts/scripts.js';

function checkAndRedirect(redirections) {
  Object.entries(redirections).some(([currentPath, redirectPath]) => {
    if (window.location.pathname.includes(currentPath)) {
      window.location.href = redirectPath;
      return true;
    }
    return false;
  });
}

function renderSignIn(element) {
  authRenderer.render(SignIn, {
    onSuccessCallback: () => {},
    formSize: 'small',
    routeForgotPassword: () => rootLink(CUSTOMER_FORGOTPASSWORD_PATH),
  })(element);
}

export function renderAuthDropdown(navTools) {
  const dropdownElement = document.createRange().createContextualFragment(`
 <div class="dropdown-wrapper nav-tools-wrapper">
    <button type="button" class="nav-dropdown-button" aria-haspopup="dialog" aria-expanded="false" aria-controls="login-modal"></button>
    <div class="nav-auth-menu-panel nav-tools-panel">
      <div id="auth-dropin-container"></div>
      <ul class="authenticated-user-menu">
         <li><a href="${rootLink('/customer/account')}">My Account</a></li>
          <li><button>Logout</button></li>
      </ul>
    </div>
 </div>`);

  navTools.append(dropdownElement);

  const authDropDownPanel = navTools.querySelector('.nav-auth-menu-panel');
  const authDropDownMenuList = navTools.querySelector(
    '.authenticated-user-menu',
  );
  const authDropinContainer = navTools.querySelector('#auth-dropin-container');
  const loginButton = navTools.querySelector('.nav-dropdown-button');
  const logoutButtonElement = navTools.querySelector(
    '.authenticated-user-menu > li > button',
  );

  authDropDownPanel.addEventListener('click', (e) => e.stopPropagation());

  async function toggleDropDownAuthMenu(state) {
    const show = state ?? !authDropDownPanel.classList.contains('nav-tools-panel--show');

    authDropDownPanel.classList.toggle('nav-tools-panel--show', show);
    authDropDownPanel.setAttribute('role', 'dialog');
    authDropDownPanel.setAttribute('aria-hidden', 'false');
    authDropDownPanel.setAttribute('aria-labelledby', 'modal-title');
    authDropDownPanel.setAttribute('aria-describedby', 'modal-description');
    authDropDownPanel.focus();
  }

  loginButton.addEventListener('click', () => toggleDropDownAuthMenu());
  document.addEventListener('click', async (e) => {
    const clickOnDropDownPanel = authDropDownPanel.contains(e.target);
    const clickOnLoginButton = loginButton.contains(e.target);

    if (!clickOnDropDownPanel && !clickOnLoginButton) {
      await toggleDropDownAuthMenu(false);
    }
  });

  logoutButtonElement.addEventListener('click', async () => {
    await authApi.revokeCustomerToken();
    checkAndRedirect({
      '/customer': rootLink('/customer/login'),
      '/order-details': rootLink('/'),
    });
  });

  renderSignIn(authDropinContainer);

  const updateDropDownUI = (isAuthenticated) => {
    const getUserTokenCookie = getCookie('auth_dropin_user_token');
    const getUserNameCookie = getCookie('auth_dropin_firstname');

    if (isAuthenticated || getUserTokenCookie) {
      authDropDownMenuList.style.display = 'block';
      authDropinContainer.style.display = 'none';
      loginButton.textContent = `Hi, ${getUserNameCookie}`;
    } else {
      authDropDownMenuList.style.display = 'none';
      authDropinContainer.style.display = 'block';
      loginButton.innerHTML = `
      <svg width="20" height="20" aria-label="My Account" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
viewBox="0 0 17 22" xml:space="preserve">
        <path id="Path_38" class="st0" d="M13.6,14.2c-1.4,0-2.6-1-2.8-2.4c0.5-0.3,0.8-0.7,1.2-1.1c0.7-0.9,1.1-2,1.2-3.2
          c0.1-0.1,0.1-0.1,0.2-0.2c0.3-0.7,0.4-1.4,0.4-2.1c0.1-2.7-2.1-5-4.8-5.1C8.2,0,7.6,0.2,7,0.5c-0.2,0-0.5,0.1-0.7,0.1
          c-1.1,0.3-2,1.2-2.5,2.2C3.3,4,3.2,5.2,3.5,6.5C3.5,6.7,3.6,7,3.7,7.2c0,0.1,0.1,0.1,0.1,0.1h0c0.1,1.7,1,3.3,2.4,4.3
          c-0.1,1.5-1.4,2.6-2.8,2.5c-1.9,0-3.4,1.6-3.4,3.5v3.8C0,21.7,0.3,22,0.6,22h15.8c0.3,0,0.6-0.3,0.6-0.6v-3.8
          C17,15.7,15.5,14.2,13.6,14.2z M4.9,15.1l2.6,3.7c0.4,0.5,1.1,0.7,1.7,0.3c0.1-0.1,0.2-0.2,0.3-0.3l2.6-3.7c0.5,0.2,0.9,0.3,1.4,0.3
          c1.3,0,2.3,1,2.3,2.3v3.2H1.2v-3.2c0-1.3,1-2.3,2.3-2.3c0,0,0,0,0,0C4,15.3,4.5,15.2,4.9,15.1L4.9,15.1z M5,7.2
          C5.6,6.7,6.1,6,6.4,5.3l0.1,0c0.3,0.3,0.8,0.4,1.2,0.4h3.4c0.4,0,0.8,0.2,1,0.6c0,2.7-1.6,4.9-3.5,4.9c-0.9,0-1.8-0.5-2.3-1.2l0,0
          C5.6,9.2,5.1,8.2,5,7.2L5,7.2z M6.6,1.6L6.6,1.6c0.2,0.1,0.4,0,0.6,0c0.1,0,0.2,0,0.3-0.1c0.5-0.2,1-0.4,1.5-0.4
          c2,0.1,3.6,1.8,3.6,3.9c-0.4-0.3-0.9-0.5-1.4-0.5H7.7C7.3,4.5,7,4.3,6.9,4C6.8,3.8,6.5,3.6,6.2,3.6c-0.3,0-0.6,0.2-0.7,0.5
          c-0.2,0.7-0.5,1.3-1,1.8C4.2,4,5.1,2.2,6.6,1.6L6.6,1.6z M7.3,12.3c0.8,0.2,1.6,0.2,2.3,0c0.2,0.9,0.7,1.6,1.4,2.2L8.5,18L6,14.5
          C6.7,13.9,7.1,13.1,7.3,12.3L7.3,12.3z"/>
        </svg>&nbsp;Login / Join Us
        `;
    }
  };

  events.on('authenticated', (isAuthenticated) => {
    updateDropDownUI(isAuthenticated);
  });

  updateDropDownUI();
}
