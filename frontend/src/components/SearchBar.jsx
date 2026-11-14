import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ initialValue = '', onSearch, placeholder = 'Search products...' }) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
      <input
        type="text"
        className="form-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{
          paddingLeft: '2.5rem',
          paddingRight: value ? '4.5rem' : '2.5rem',
          borderRadius: '9999px',
          backgroundColor: '#FFFFFF'
        }}
      />
      <Search
        size={18}
        color="var(--text-muted)"
        style={{
          position: 'absolute',
          left: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none'
        }}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '48px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-light)',
            padding: '4px'
          }}
        >
          <X size={16} />
        </button>
      )}
      <button
        type="submit"
        className="btn btn-primary btn-sm"
        style={{
          position: 'absolute',
          right: '4px',
          top: '50%',
          transform: 'translateY(-50%)',
          borderRadius: '9999px',
          padding: '0.4rem 0.85rem'
        }}
      >
        Go
      </button>
    </form>
  );
}

