import axios from 'axios';
import { GET_ERRORS, SET_CURRENT_USER } from './types'
import setAuthToken from '../utils/setAuthToken';
import jwt_decode from 'jwt-decode';


// Register user
export const registerUser = (userData, history) => dispatch => {
    axios
      .post("/api/users/register", userData)
      .then(res => history.push('/login'))
      .catch(err => {
          dispatch({
              type: GET_ERRORS,
              payload: err.response.data  
        })
      });
}

// login - get user token

export const loginUser = (userData) => dispatch => {
    axios.post('/api/users/login', userData)
        .then(res => {
            // Get token and save to local storage
            const { token } = res.data;
            localStorage.setItem('jwtToken', token);
            // set token to Auth header
            setAuthToken(token);
            // Decode token to get user data
            const decoded = jwt_decode(token);
            // set current user
            dispatch(setCurrentUser(decoded))

        })
        .catch(err => 
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        )
}

// set logged in user

export const setCurrentUser = (decoded) => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded
    }
}

// log user out

export const logoutUser = () => dispatch => {
    // Remove token from local storage
    localStorage.removeItem('jwtToken');
    // Remove auth header for future requests
    setAuthToken(false);
    // Set current user to empty object which will set isAuthenticated to false
    dispatch(setCurrentUser({}))
}