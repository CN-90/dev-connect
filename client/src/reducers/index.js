import { combineReducers } from 'redux';
import authReducers from './authReducer';
import errorReducer from './errorReducer'

export default combineReducers({
    auth: authReducers,
    errors: errorReducer
})