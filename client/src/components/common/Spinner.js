import React from "react";
import spinner from '../../img/spinner.gif'

const Spinner = () => {
    return (
        <div>
            <img style={{ width: '200px', margin: 'auto', display: 'block' }} src={spinner} alt='Loading...' />
        </div>
    )
}

export default Spinner;