const Form = ({ onSubmit, children, className = "" }) => {
  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
      {children}
    </form>
  );
};


const FormInput = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  name,
}) => {
  return (
    <div>
      <label className="label">
        {label}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="form-input"
      />
    </div>
  );
};
const FormButton = ({
  children,
  type = "submit",
  variant = "primary",
  onClick,
  disabled = false,
}) => {
  const variants = {
    primary: "btn-full",
    secondary: "btn-secondary w-full",
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};
export { Form, FormInput, FormButton }
