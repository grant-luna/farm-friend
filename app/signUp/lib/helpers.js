export function validateFormInputs(formData, errorObject, setErrorObject) {
  let errorObjectCopy = { ...errorObject };
  ClientHelper.processFormInputs(formData, errorObjectCopy);
  setErrorObject(errorObjectCopy);
}

class ClientHelper {
  static processFormInputs(formData, errorObjectCopy) {
    this.validateUserEmail(formData.userEmail, errorObjectCopy);
    this.validateUserFirstName(formData.userFirstName, errorObjectCopy);
    this.validateUserLastName(formData.userLastName, errorObjectCopy);
    this.validateUserPassword(formData.userPassword, errorObjectCopy);
  }

  static validateUserEmail(userEmail, errorObjectCopy ) {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail);
    const errorMessage = 'Please enter a valid email address.'

    errorObjectCopy.userEmail.message = isValidEmail ? undefined : errorMessage;
  }

  static validateUserFirstName(userFirstName, errorObjectCopy) {
    const isValidFirstName = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(userFirstName);
    const errorMessage = 'Please enter a valid first name. Names can only contain letters, hyphens, apostrophes, and spaces.'

    errorObjectCopy.userFirstName.message = isValidFirstName ? undefined : errorMessage;
  }

  static validateUserLastName(userLastName, errorObjectCopy) {
    const isValidLastName = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(userLastName);
    const errorMessage = 'Please enter a valid lsat name. Names can only contain letters, hyphens, apostrophes, and spaces.'

    errorObjectCopy.userLastName.message = isValidLastName ? undefined : errorMessage;
  }
  
  static validateUserPassword(userPassword, errorObjectCopy) {
    const isValidPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(userPassword);
    const errorMessage = 'Your password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one special character (e.g., @$!%*?&).';

    errorObjectCopy.userPassword.message = isValidPassword ? undefined : errorMessage
  }
} 