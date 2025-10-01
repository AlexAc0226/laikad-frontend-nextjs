"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Box, Input, useTheme } from '@mui/material';

interface SearchableSelectOption {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  height?: number;
  onClear?: () => void;
  clearable?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Search...",
  label,
  disabled = false,
  fullWidth = false,
  height = 48,
  onClear,
  clearable = false
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Encontrar la opción seleccionada para mostrar en el input
  const selectedOption = options.find(option => option.value === value);

  // Filtrar opciones basado en el término de búsqueda
  const filteredOptions = options.filter(option =>
    searchTerm.length === 0 || 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar cambios en el input de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);

    if (newSearchTerm.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      if (clearable && onClear) {
        onClear();
      }
    }
  };

  // Manejar selección de una opción
  const selectOption = (option: SearchableSelectOption) => {
    onChange(option.value);
    setSearchTerm(option.label);
    setShowSuggestions(false);
    setIsFocused(false);
  };

  // Manejar focus del input
  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
    // Si hay una opción seleccionada, mostrar el texto de búsqueda vacío
    if (selectedOption) {
      setSearchTerm("");
    }
  };

  // Manejar blur del input
  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
      // Restaurar el texto de la opción seleccionada si no hay búsqueda activa
      if (selectedOption && !searchTerm) {
        setSearchTerm(selectedOption.label);
      }
    }, 200);
  };

  // Manejar clicks fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setIsFocused(false);
        if (selectedOption && !searchTerm) {
          setSearchTerm(selectedOption.label);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedOption, searchTerm]);

  // Sincronizar el valor del input con la opción seleccionada
  useEffect(() => {
    if (selectedOption && !isFocused) {
      setSearchTerm(selectedOption.label);
    }
  }, [selectedOption, isFocused]);

  return (
    <Box sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <Box sx={{ mb: 1 }}>
          <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary }}>
            {label}
          </label>
        </Box>
      )}
      
      <Input
        ref={inputRef}
        fullWidth={fullWidth}
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        sx={{
          height: height,
          bgcolor: theme.palette.background.paper,
          borderRadius: 1,
          '& .MuiInputBase-input': {
            color: theme.palette.text.primary,
            '&::placeholder': {
              color: theme.palette.text.secondary,
              opacity: 1
            }
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.divider,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.text.secondary,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
          },
          opacity: disabled ? 0.5 : 1,
        }}
      />

      {showSuggestions && filteredOptions.length > 0 && (
        <Box
          ref={suggestionsRef}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            maxHeight: 240,
            overflowY: 'auto',
            zIndex: 1000,
            mt: 0.5,
            boxShadow: theme.shadows[4],
          }}
        >
          {filteredOptions.map((option) => (
            <Box
              key={option.value}
              onClick={() => selectOption(option)}
              sx={{
                p: 1.5,
                cursor: 'pointer',
                color: theme.palette.text.primary,
                borderBottom: `1px solid ${theme.palette.divider}`,
                '&:hover': { 
                  bgcolor: theme.palette.action.hover 
                },
                '&:last-child': {
                  borderBottom: 'none'
                }
              }}
            >
              {option.label}
            </Box>
          ))}
        </Box>
      )}

      {showSuggestions && filteredOptions.length === 0 && searchTerm.length > 0 && (
        <Box
          ref={suggestionsRef}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            zIndex: 1000,
            mt: 0.5,
            boxShadow: theme.shadows[4],
            p: 2,
            textAlign: 'center',
            color: theme.palette.text.secondary,
          }}
        >
          No options found
        </Box>
      )}
    </Box>
  );
};

export default SearchableSelect;
