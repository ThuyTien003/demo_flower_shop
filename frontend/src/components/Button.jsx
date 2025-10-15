
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  ...props 
}) => {
  const baseStyles = {
    padding: size === 'small' ? '6px 12px' : size === 'large' ? '12px 20px' : '10px 16px',
    borderRadius: 8,
    border: 'none',
    fontWeight: 700,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    transition: 'all 0.2s ease',
    fontSize: size === 'small' ? 14 : 16,
  };

  const variantStyles = {
    primary: {
      background: '#14452F',
      color: '#fff',
    },
    secondary: {
      background: '#fff',
      color: '#14452F',
      border: '1px solid #14452F',
    },
    danger: {
      background: '#b00020',
      color: '#fff',
    },
    ghost: {
      background: 'transparent',
      color: '#14452F',
      border: '1px solid #e5e7eb',
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{ ...baseStyles, ...variantStyles[variant] }}
      {...props}
    >
      {loading ? 'Đang xử lý...' : children}
    </button>
  );
};

export default Button;
