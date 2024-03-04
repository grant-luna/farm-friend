;export class ClientWorker {
  static handleAccountDropdownToggleDisplay(_event) {
    const accountDropdownMenu = document.querySelector('.account-dropdown-menu');
    const signOutButton = document.querySelector('.account-dropdown-menu-sign-out');

    // Check if Account Dropdown Menu exists and doesn't have a display
    if (accountDropdownMenu && !accountDropdownMenu.style.display) {
      const accountDropdownMenuStyles = {
        position: 'absolute',
        top: '-.1rem',
        right: '0',
        backgroundColor: 'var(--dark-blue)',
        zIndex: '2',
        color: 'var(--white)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '.15rem',
        width: '240px',
      }
      
      signOutButton.addEventListener('click', ClientWorker.handleSignOut);
      Object.assign(accountDropdownMenu.style, accountDropdownMenuStyles);
    } else {
      signOutButton.removeEventListener('click', ClientWorker.handleSignOut);
      accountDropdownMenu.style.display = '';
    }
  }

  static async handleSignOut(event) {
    try {
      const response = await fetch('/sign-out', { method: 'POST' });
      if (response.ok) {
        window.location.href = response.url;
      } else {
        console.error('Error signing out:', response.statusText);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}