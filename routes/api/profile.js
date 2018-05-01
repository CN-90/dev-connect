const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
router = express.Router();

// Load User & Profile Models
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// Load validation
const validateProfileInput = require('../../validation/profile')
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

router.get('/test', (req, res) => {
    res.json({
        msg: 'Profile works...'
    })
}) 


// Get user profile
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
    .populate('user', ['name', 'avatar'])    
        .then((profile) => {
            if (!profile) {
                errors.noprofile = "There is no profile for this user";
                return res.status(404).json(errors)
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
})

// Get all user profiles
router.get('/all', (req, res) => {
    const errors = {};
    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
            if (!profiles) {
                errors.noprofile = "There are no profiles."
                return res.status(404).json(errors)
            }
            res.json(profiles);
        })
        .catch( err => res.status(404).json('There are no profiles.'))
})

// Get user profile by handle.
router.get('/handle/:handle', (req, res) => {
    const errors = {};
    Profile.findOne({ handle: req.params.handle })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user.';
                res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err))
})

// Get user profile by id
router.get('/user/:user_id', (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.params.user_id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user.';
                res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json({profile: 'There is no profile for that user.'}))
})

// Create user or edit profile
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body)
    if (!isValid) {
        // Return error if fields are not valid.
        return res.status(400).json(errors);
    }
    // Get profile fields
    const profile = {};
    profile.user = req.user.id;
    if (req.body.handle) profile.handle = req.body.handle;
    if (req.body.company) profile.company = req.body.company;
    if (req.body.website) profile.website = req.body.website;
    if (req.body.location) profile.location = req.body.location;
    if (req.body.bio) profile.bio = req.body.bio;
    if (req.body.status) profile.status = req.body.status;
    if (req.body.github) profile.github = req.body.github;
    
    //split skills into an array
    if (typeof req.body.skills !== 'undefined') {
        profile.skills = req.body.skills.split(',')
    }

    // Social Services
    profile.social = {};
    if (req.body.youtube) profile.social.youtube = req.body.youtube;
    if (req.body.twitter) profile.social.twitter = req.body.twitter;
    if (req.body.facebook) profile.social.facebook = req.body.facebook;
    if (req.body.linkedin) profile.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profile.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id })
        .then( userProfile => {
            if (userProfile) {
                // Update profile
                Profile.findOneAndUpdate({ user: req.user.id }, { $set: profile }, { new: true })
                    .then(profile => res.json(profile));
            } else {
                // Create profile
                //Check if handle exists
                Profile.findOne({ handle: profile.handle }).then( userProfile => {
                        if (userProfile) {
                            errors.handle = 'That handle already in use.'
                            res.status(400).json(errors);
                        }
                        // Save profile
                        new Profile(profile).save().then(profile => res.json(profile));
                 })
            }
        })
})

// Add experience to profile (private route)
router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body)
    // check validation
    if (!isValid) {
        // Return error if fields are not valid.
        return res.status(400).json(errors);
    }
    
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }

            // Add to Experience array
            profile.experience.unshift(newExp);
            profile.save().then(profile => res.json(profile));
        })
})

// Add education to profile
router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body)
    // check validation
    if (!isValid) {
        // Return error if fields are not valid.
        return res.status(400).json(errors);
    }
    
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const newEdu = {
                school: req.body.school,
                degree: req.body.degree,
                fieldOfStudy: req.body.fieldOfStudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }

            // Add to Experience array
            profile.education.unshift(newEdu);
            profile.save().then(profile => res.json(profile));
        })
})

// Delete user experience
router.delete('/experience/:exp_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            // Get remove index
            const removeIndex = profile.experience
                .map(item => item.id)
                .indexOf(req.params.exp_id);
            //Splice out of array
            profile.experience.splice(removeIndex, 1);
            profile.save().then(profile => res.json(profile));
        })
        .catch(err => res.status(404).json(err));
})

// Delete user education
router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            // Get remove index
            const removeIndex = profile.education
                .map(item => item.id)
                .indexOf(req.params.edu_id);
            //Splice out of array
            profile.education.splice(removeIndex, 1);
            profile.save().then(profile => res.json(profile));
        })
        .catch(err => res.status(404).json(err));
})

// Delete user and profile from database
router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id })
        .then(() => {
            User.findOneAndRemove({ _id: req.user.id })
                .then(() => res.json({ success: true }));
        })
})

module.exports = router;