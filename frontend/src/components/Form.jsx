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
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md
focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
  const baseClasses =
    "w-full py-2 px-4 rounded-md font-medium transition-colors";
  const variants = {
    primary: "bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]}`}
    >
      {children}
    </button>
  );
};
export { Form, FormInput, FormButton }
