const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateProfileInput(data) {
    let errors = {};
    
    data.handle = !isEmpty(data.handle) ? data.handle : '';
    data.status = !isEmpty(data.status) ? data.status : '';
    data.skills = !isEmpty(data.skills) ? data.skills : '';
    
    if (!Validator.isLength(data.handle, { min: 2, max: 20 })) {
        errors.handle = 'Handle must be between two and twenty characters.'
    }

    if (Validator.isEmpty(data.handle)) {
        errors.handle = 'Profile handle is required.'
    }

    if (Validator.isEmpty(data.status)) {
        errors.status = 'Status field is required.'
    }

    if (Validator.isEmpty(data.skills)) {
        errors.skills = 'Skill field is required.'
    }

    if (!isEmpty(data.website)) {
        if (!Validator.isURL(data.website)) {
            errors.website = 'That is not a valid URL';
        }
    }

    if (!isEmpty(data.youtube)) {
        if (!Validator.isURL(data.youtube)) {
            errors.youtube = 'That is not a valid URL';
        }
    }
    
    if (!isEmpty(data.twitter)) {
        if (!Validator.isURL(data.twitter)) {
            errors.twitter = 'That is not a valid URL';
        }
    }

    if (!isEmpty(data.facebook)) {
        if (!Validator.isURL(data.facebook)) {
            errors.facebook = 'That is not a valid URL';
        }
    }

    if (!isEmpty(data.linkedin)) {
        if (!Validator.isURL(data.linkedin)) {
            errors.linkedin = 'That is not a valid URL';
        }
    }
    
    if (!isEmpty(data.instagram)) {
        if (!Validator.isURL(data.instagram)) {
            errors.instagram = 'That is not a valid URL';
        }
    }
    
    return {
        errors,
        isValid: isEmpty(errors)
    }
}