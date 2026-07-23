import * as React from 'react';
import styled from 'styled-components';
import { CaretDown, Check, Cross } from '@strapi/icons';

interface Option {
  id: number;
  label: string;
}

interface QuickSelectDropdownProps {
  label: string;
  options: Option[];
  selectedIds: number[];
  multi: boolean;
  onChange: (ids: number[]) => void;
}

const SEARCH_THRESHOLD = 8;

const Wrapper = styled.div`
  position: relative;
  display: inline-flex;
`;

const Trigger = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 3.2rem;
  padding: 0 1.2rem;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid
    ${({ theme, $active }) => ($active ? theme.colors.primary600 : theme.colors.neutral200)};
  background: ${({ theme, $active }) => ($active ? theme.colors.primary100 : theme.colors.neutral0)};
  color: ${({ theme, $active }) => ($active ? theme.colors.primary600 : theme.colors.neutral800)};
  font-size: 1.3rem;
  font-weight: 600;
  line-height: 2rem;
  cursor: pointer;
  transition: border-color 0.12s ease, background-color 0.12s ease;
  white-space: nowrap;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary600};
  }

  svg {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.8rem;
  height: 1.8rem;
  padding: 0 0.5rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.primary600};
  color: ${({ theme }) => theme.colors.neutral0};
  font-size: 1.1rem;
  font-weight: 700;
`;

const ClearIcon = styled.span`
  display: inline-flex;
  padding: 0.2rem;
  border-radius: 999px;

  &:hover {
    background: ${({ theme }) => theme.colors.primary200};
  }

  svg {
    width: 0.8rem;
    height: 0.8rem;
  }
`;

const Panel = styled.div`
  position: absolute;
  top: calc(100% + 0.4rem);
  right: 0;
  z-index: ${({ theme }) => theme.zIndices.popover};
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: max-content;
  min-width: 22rem;
  max-height: 32rem;
  padding: 0.8rem;
  border-radius: 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.neutral200};
  background: ${({ theme }) => theme.colors.neutral0};
  box-shadow: ${({ theme }) => theme.shadows.popupShadow};
`;

const SearchInput = styled.input`
  box-sizing: border-box;
  width: 100%;
  height: 3.2rem;
  padding: 0 1rem;
  border-radius: 0.4rem;
  border: 1px solid ${({ theme }) => theme.colors.neutral200};
  background: ${({ theme }) => theme.colors.neutral100};
  color: ${({ theme }) => theme.colors.neutral800};
  font-size: 1.3rem;

  &::placeholder {
    color: ${({ theme }) => theme.colors.neutral500};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary600};
    background: ${({ theme }) => theme.colors.neutral0};
  }
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: 24rem;
`;

// Visually hidden but still in the accessibility tree (unlike display:none),
// so screen readers and a11y-driven tooling can still find/toggle it — the
// custom `Indicator` span below renders the actual visible check state.
const HiddenInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  opacity: 0;
`;

const OptionRow = styled.label<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 0.4rem;
  cursor: pointer;
  font-size: 1.3rem;
  color: ${({ theme }) => theme.colors.neutral800};
  background: ${({ theme, $checked }) => ($checked ? theme.colors.primary100 : 'transparent')};

  &:hover {
    background: ${({ theme, $checked }) => ($checked ? theme.colors.primary100 : theme.colors.neutral100)};
  }
`;

const Indicator = styled.span<{ $checked: boolean; $round: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: ${({ $round }) => ($round ? '50%' : '0.4rem')};
  border: 1.5px solid
    ${({ theme, $checked }) => ($checked ? theme.colors.primary600 : theme.colors.neutral300)};
  background: ${({ theme, $checked }) => ($checked ? theme.colors.primary600 : 'transparent')};

  svg {
    width: 1rem;
    height: 1rem;
  }

  svg path {
    fill: ${({ theme }) => theme.colors.neutral0};
  }
`;

const EmptyState = styled.p`
  padding: 0.8rem 1rem;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.neutral500};
`;

export const QuickSelectDropdown = ({
  label,
  options,
  selectedIds,
  multi,
  onChange,
}: QuickSelectDropdownProps) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const toggle = (id: number) => {
    if (multi) {
      const next = selectedIds.includes(id)
        ? selectedIds.filter((existing) => existing !== id)
        : [...selectedIds, id];
      onChange(next);
    } else {
      onChange(selectedIds.includes(id) ? [] : [id]);
      setOpen(false);
    }
  };

  const filteredOptions =
    options.length > SEARCH_THRESHOLD && search.trim()
      ? options.filter((opt) => opt.label.toLowerCase().includes(search.trim().toLowerCase()))
      : options;

  return (
    <Wrapper ref={wrapperRef}>
      <Trigger type="button" $active={selectedIds.length > 0} onClick={() => setOpen((v) => !v)}>
        {label}
        {selectedIds.length > 0 && <Badge>{selectedIds.length}</Badge>}
        {selectedIds.length > 0 ? (
          <ClearIcon
            onClick={(event) => {
              event.stopPropagation();
              onChange([]);
            }}
          >
            <Cross />
          </ClearIcon>
        ) : (
          <CaretDown />
        )}
      </Trigger>
      {open && (
        <Panel>
          {options.length > SEARCH_THRESHOLD && (
            <SearchInput
              autoFocus
              placeholder={`Tìm ${label.toLowerCase()}...`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          )}
          <OptionList>
            {filteredOptions.length === 0 && <EmptyState>Không có kết quả</EmptyState>}
            {filteredOptions.map((opt) => {
              const checked = selectedIds.includes(opt.id);
              return (
                <OptionRow key={opt.id} $checked={checked}>
                  <HiddenInput
                    type={multi ? 'checkbox' : 'radio'}
                    checked={checked}
                    onChange={() => toggle(opt.id)}
                  />
                  <Indicator $checked={checked} $round={!multi}>
                    {checked && <Check />}
                  </Indicator>
                  {opt.label}
                </OptionRow>
              );
            })}
          </OptionList>
        </Panel>
      )}
    </Wrapper>
  );
};
