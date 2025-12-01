import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../page';

describe('Home Page', () => {
  it('renders the heading', () => {
    render(<Home />);
    expect(screen.getByText('Journal')).toBeInTheDocument();
  });

  it('renders the welcome message', () => {
    render(<Home />);
    expect(screen.getByText(/Welcome to your journal application/i)).toBeInTheDocument();
  });
});

