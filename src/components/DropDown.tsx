import { ChangeEventHandler } from 'react';

import styled from 'styled-components';

const Header = styled.h4`
  text-transform: uppercase;
  text-decoration: none;
  margin: 5rem 0 1rem 2rem;
`;

const WideSelect = styled.select`
  width: 100%;
`;

interface LabelValueTuple {
  label: string;
  value: number;
}

interface DropDownProps {
  label: string;
  value: number;
  options: Array<LabelValueTuple>;
  onChange: ChangeEventHandler<HTMLSelectElement>;
}

const DropDown = (props: DropDownProps) => {
  const { label, value, onChange, options } = props;
  return (
    <Header>
      {label}
      <WideSelect value={value} onChange={onChange}>
        {options.map((option) => (
          <option value={option.value}>
            <h6>{option.label}</h6>
          </option>
        ))}
      </WideSelect>
    </Header>
  );
};

export default DropDown;
