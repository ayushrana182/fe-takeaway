import PropTypes from 'prop-types';
import classes from './index.module.css';

const Input = ({ value, onChange, placeholder, type = 'text', style, className }) => {
    return (
        <input
            className={`${classes.input}`}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            style={style}
        />
    );
};

Input.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    type: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
};

export default Input;