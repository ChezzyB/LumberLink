import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedText } from '../../components/ThemedText';

// Mock the useStyleTheme hook
jest.mock('../../context/ThemeContext', () => ({
  useStyleTheme: () => ({ theme: 'light' })
}));

describe('ThemedText Component', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(<ThemedText>Test Text</ThemedText>);
    expect(getByText('Test Text')).toBeTruthy();
  });

  it('renders with custom type', () => {
    const { getByText } = render(
      <ThemedText type="title">Title Text</ThemedText>
    );
    expect(getByText('Title Text')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const customStyle = { fontSize: 20, color: 'red' };
    const { getByText } = render(
      <ThemedText style={customStyle}>Styled Text</ThemedText>
    );
    
    const textElement = getByText('Styled Text');
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining(customStyle)])
    );
  });
});