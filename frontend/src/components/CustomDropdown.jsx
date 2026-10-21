import React, { useState, useEffect, useRef, useId } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

/**
 * CustomDropdown
 * A premium, smooth, oval-bordered dropdown component following Bizora's Claymorphic Design System.
 * Replaces standard browser <select> controls across the entire application with an accessible,
 * beautifully animated, keyboard-friendly pill/oval dropdown.
 *
 * Brand Palette:
 * - Deep Purple: #3B1C5A (text, active background, strong borders)
 * - Lavender: #F0EAFB / #C6B7E2 (surface tints, hover states, soft borders)
 * - Warm Cream: #FAF7F2 (trigger and search surfaces)
 * - Gold: #E6B44C (checkmarks, active accents, chevrons)
 * - White: #FFFFFF
 */
export default function CustomDropdown({
  id: propId,
  name,
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  disabled = false,
  required = false,
  error = null,
  icon: Icon = null,
  searchable = undefined,
  clearable = false,
  className = '',
  menuClassName = '',
  variant = 'oval', // 'oval' (rounded-full) or 'smooth' (rounded-2xl)
  size = 'md', // 'sm', 'md', 'lg'
  ariaLabel = undefined,
}) {
  const generatedId = useId();
  const dropdownId = propId || name || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options: supports primitives (string/number) or objects { value, label, badge, icon }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value !== undefined ? opt.value : opt.label,
        label: opt.label !== undefined ? String(opt.label) : String(opt.value),
        badge: opt.badge,
        icon: opt.icon
      };
    }
    return {
      value: opt,
      label: String(opt),
      badge: null,
      icon: null
    };
  });

  // Determine if search should be enabled (auto-enable when > 6 options unless explicitly set)
  const isSearchable = searchable !== undefined ? searchable : normalizedOptions.length > 6;

  // Filter options based on search query
  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  // Find currently selected option object
  const currentOption = normalizedOptions.find((opt) => String(opt.value) === String(value));
  const displayText = currentOption ? currentOption.label : '';
  const hasValue = value !== undefined && value !== null && value !== '' && currentOption;

  // Close dropdown on outside click or touch
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && isSearchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, isSearchable]);

  // Handle option selection
  const handleSelect = (optionVal) => {
    setIsOpen(false);
    setSearch('');
    if (onChange) {
      const syntheticEvent = {
        target: { name: name || '', value: optionVal, type: 'select' },
        currentTarget: { name: name || '', value: optionVal, type: 'select' },
        value: optionVal,
        toString: () => String(optionVal),
        valueOf: () => optionVal
      };
      // Provide optionVal as 1st param and syntheticEvent as 2nd param for versatility
      onChange(optionVal, syntheticEvent);
    }
  };

  // Handle clear selection
  const handleClear = (e) => {
    e.stopPropagation();
    handleSelect('');
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearch('');
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      if (!isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      }
    }
  };

  // Sizing styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs min-h-[34px]',
    md: 'px-4 py-2.5 text-xs min-h-[40px]',
    lg: 'px-5 py-3 text-sm min-h-[46px]'
  };

  // Trigger rounded border styles: oval (rounded-full) or smooth (rounded-2xl)
  const triggerRadius = variant === 'smooth' ? 'rounded-2xl' : 'rounded-full';
  const menuRadius = variant === 'smooth' ? 'rounded-2xl' : 'rounded-3xl';

  return (
    <div className={`relative w-full text-left ${className}`} ref={dropdownRef}>
      {label && (
        <label
          htmlFor={dropdownId}
          className="block text-xs font-bold text-[#3B1C5A] mb-1.5 uppercase tracking-wider"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Dropdown Trigger Button */}
      <button
        id={dropdownId}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || label || placeholder}
        className={`w-full ${sizeStyles[size]} ${triggerRadius} text-left transition-all duration-200 flex items-center justify-between cursor-pointer border-2 shadow-xs group ${
          isOpen
            ? 'bg-white border-[#3B1C5A] ring-3 ring-[#C6B7E2]/50 shadow-md'
            : 'bg-[#FAF7F2] hover:bg-white border-[#C6B7E2]/70 hover:border-[#3B1C5A]/60'
        } ${error ? '!border-rose-400 !bg-rose-50/50 ring-2 ring-rose-200' : ''} ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 hover:border-[#C6B7E2]/70' : ''
        }`}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          {Icon && (
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                isOpen ? 'text-[#3B1C5A]' : 'text-[#79688A] group-hover:text-[#3B1C5A]'
              }`}
            />
          )}
          <span
            className={`truncate ${
              hasValue ? 'text-[#3B1C5A] font-bold' : 'text-[#79688A] font-medium'
            }`}
          >
            {displayText || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {clearable && hasValue && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              title="Clear selection"
              className="p-1 rounded-full text-[#79688A] hover:text-[#3B1C5A] hover:bg-[#C6B7E2]/30 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
              isOpen ? 'bg-[#3B1C5A] text-white rotate-180' : 'bg-[#C6B7E2]/25 text-[#3B1C5A] group-hover:bg-[#C6B7E2]/40'
            }`}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>
      </button>

      {/* Floating Menu Popover */}
      {isOpen && !disabled && (
        <div
          role="listbox"
          className={`absolute left-0 right-0 top-full mt-2 z-50 ${menuRadius} bg-white/98 backdrop-blur-md border-2 border-[#C6B7E2]/70 shadow-2xl shadow-[#3B1C5A]/15 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-2 ${menuClassName}`}
        >
          {/* Optional Oval Search Input */}
          {isSearchable && (
            <div className="p-1 pb-2 mb-1 border-b border-[#C6B7E2]/30">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#79688A] pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${label || 'options'}...`}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-[#FAF7F2] rounded-full border border-[#C6B7E2]/60 text-[#3B1C5A] placeholder-[#79688A] focus:outline-none focus:border-[#3B1C5A] focus:bg-white transition-all shadow-xs"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#79688A] hover:text-[#3B1C5A]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options Scrollable List */}
          <div className="max-h-60 overflow-y-auto space-y-1 p-0.5 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3.5 text-center text-xs text-[#79688A] italic">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                const ItemIcon = opt.icon;
                return (
                  <button
                    key={String(opt.value) + '-' + opt.label}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-full text-xs flex items-center justify-between transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-[#3B1C5A] text-white font-bold shadow-xs pl-4'
                        : 'text-[#3B1C5A] hover:bg-[#F0EAFB] hover:text-[#3B1C5A] hover:pl-4 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      {ItemIcon && (
                        <ItemIcon
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? 'text-[#E6B44C]' : 'text-[#79688A]'
                          }`}
                        />
                      )}
                      <span className="truncate">{opt.label}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {opt.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isSelected
                              ? 'bg-white/20 text-[#FAF7F2]'
                              : 'bg-[#C6B7E2]/30 text-[#3B1C5A]'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#E6B44C] flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 text-[#3B1C5A] stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1.5 text-[11px] text-rose-600 font-medium pl-2">{error}</p>}
    </div>
  );
}

