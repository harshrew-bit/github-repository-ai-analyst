/**
 * Regression tests for AnswerPanel Markdown rendering.
 *
 * These tests verify that:
 *   A. Filenames inside prose render as inline <code>, NOT as block containers.
 *   B. Function/package names remain inline within a single paragraph.
 *   C. Genuine fenced Python code blocks render as a syntax-highlighted block
 *      with a copy button.
 *   D. Mixed Markdown renders all elements correctly without fragmentation.
 *   E. Multiple inline identifiers stay in the same paragraph.
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AnswerPanel } from '../components/AnswerPanel';

// Mock navigator.clipboard so copy tests don't fail in jsdom
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

// Mock lucide-react icons to simple spans (avoids SVG issues in jsdom)
vi.mock('lucide-react', () => ({
  Copy: () => <span data-testid="icon-copy" />,
  Check: () => <span data-testid="icon-check" />,
  ShieldCheck: () => <span data-testid="icon-shield" />,
  Terminal: () => <span data-testid="icon-terminal" />,
}));

const DEFAULT_PROPS = {
  question: 'Test question?',
  repository: 'owner/repo',
  sourcesCount: 3,
};

function renderPanel(answer: string) {
  return render(<AnswerPanel {...DEFAULT_PROPS} answer={answer} />);
}

// ---------------------------------------------------------------------------
// Test A: Filenames inside prose → inline code, not block containers
// ---------------------------------------------------------------------------
describe('Test A – Filenames inside prose', () => {
  it('renders filenames as inline <code> elements, not block containers', () => {
    const { container } = renderPanel(
      'The project configuration is defined in `pyproject.toml`, and the main implementation is in `plot_data.py`.'
    );

    // There must be exactly two <code> elements (one per filename)
    const codes = container.querySelectorAll('code');
    expect(codes.length).toBe(2);
    expect(codes[0].textContent).toBe('pyproject.toml');
    expect(codes[1].textContent).toBe('plot_data.py');

    // There must be NO dark block container (the big code surface div)
    // Block containers have bg-charcoal-900 class
    const blockDivs = container.querySelectorAll('[class*="charcoal-900"]');
    expect(blockDivs.length).toBe(0);

    // Both inline codes should sit inside a <p> element
    const paragraph = container.querySelector('p');
    expect(paragraph).not.toBeNull();
    expect(paragraph!.textContent).toContain('pyproject.toml');
    expect(paragraph!.textContent).toContain('plot_data.py');
  });
});

// ---------------------------------------------------------------------------
// Test B: Functions and packages → inline, one paragraph
// ---------------------------------------------------------------------------
describe('Test B – Functions and packages', () => {
  it('renders function and package names inline within a single paragraph', () => {
    const { container } = renderPanel(
      'The `read_csv_data()` function uses `pandas.read_csv()` to load the file and returns the selected columns as lists.'
    );

    const codes = container.querySelectorAll('code');
    expect(codes.length).toBe(2);
    expect(codes[0].textContent).toBe('read_csv_data()');
    expect(codes[1].textContent).toBe('pandas.read_csv()');

    // No dark block container
    const blockDivs = container.querySelectorAll('[class*="charcoal-900"]');
    expect(blockDivs.length).toBe(0);

    // Single paragraph
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Test C: Genuine Python fenced code block
// ---------------------------------------------------------------------------
describe('Test C – Genuine Python code block', () => {
  it('renders fenced code as a block container with copy button and language label', () => {
    const markdown = `Here is an example:

\`\`\`python
import pandas as pd

df = pd.read_csv(file_path)
print(df.head())
\`\`\`
`;
    const { container } = renderPanel(markdown);

    // Must have the intro sentence as a paragraph
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBeGreaterThanOrEqual(1);
    expect(paragraphs[0].textContent).toContain('Here is an example');

    // Must have the block container (dark surface)
    const blockDivs = container.querySelectorAll('[class*="charcoal-900"]');
    expect(blockDivs.length).toBeGreaterThanOrEqual(1);

    // Must have a copy button
    const copyButton = screen.getByRole('button', { name: /copy code snippet/i });
    expect(copyButton).not.toBeNull();

    // Must show the language label "python"
    expect(container.textContent).toContain('python');

    // The code content must be inside a <pre>
    const pre = container.querySelector('pre');
    expect(pre).not.toBeNull();
    expect(pre!.textContent).toContain('import pandas as pd');
  });
});

// ---------------------------------------------------------------------------
// Test D: Mixed Markdown
// ---------------------------------------------------------------------------
describe('Test D – Mixed Markdown', () => {
  const mixedMarkdown = `## Overview

The repository uses \`argparse\` for CLI argument parsing.

Key functions:

1. \`read_csv_data()\` — reads the CSV file
2. \`create_plot()\` — generates the chart

Here is a code example:

\`\`\`python
df = pd.read_csv(file_path)
x = df[x_column].tolist()
\`\`\`

The function returns a tuple of lists.
`;

  it('renders heading correctly', () => {
    const { container } = renderPanel(mixedMarkdown);
    const prose = container.querySelector('.answer-prose');
    const h2 = prose!.querySelector('h2');
    expect(h2).not.toBeNull();
    expect(h2!.textContent).toBe('Overview');
  });

  it('renders inline identifiers as inline code', () => {
    const { container } = renderPanel(mixedMarkdown);
    // argparse, read_csv_data(), create_plot() should all be inline
    const codes = Array.from(container.querySelectorAll('code'));
    const codeTexts = codes.map(c => c.textContent ?? '');
    expect(codeTexts).toContain('argparse');
    expect(codeTexts).toContain('read_csv_data()');
    expect(codeTexts).toContain('create_plot()');
  });

  it('renders the fenced code block as a block container', () => {
    const { container } = renderPanel(mixedMarkdown);
    const blockDivs = container.querySelectorAll('[class*="charcoal-900"]');
    expect(blockDivs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the ordered list correctly', () => {
    const { container } = renderPanel(mixedMarkdown);
    const ol = container.querySelector('ol');
    expect(ol).not.toBeNull();
    const items = ol!.querySelectorAll('li');
    expect(items.length).toBe(2);
  });

  it('has no empty block containers', () => {
    const { container } = renderPanel(mixedMarkdown);
    const blockDivs = Array.from(container.querySelectorAll('[class*="charcoal-900"]'));
    for (const div of blockDivs) {
      expect(div.textContent!.trim().length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Test E: Multiple inline identifiers
// ---------------------------------------------------------------------------
describe('Test E – Multiple inline identifiers in one paragraph', () => {
  it('keeps all identifiers inline within a single paragraph', () => {
    const { container } = renderPanel(
      'The application uses `argparse` to parse `file_path`, `x_column`, and `y_column`, then calls `create_plot()`.'
    );

    // All five identifiers must be <code> elements
    const codes = container.querySelectorAll('code');
    expect(codes.length).toBe(5);

    const texts = Array.from(codes).map(c => c.textContent ?? '');
    expect(texts).toContain('argparse');
    expect(texts).toContain('file_path');
    expect(texts).toContain('x_column');
    expect(texts).toContain('y_column');
    expect(texts).toContain('create_plot()');

    // Must be ONE paragraph, no dark block containers
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(1);

    const blockDivs = container.querySelectorAll('[class*="charcoal-900"]');
    expect(blockDivs.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Copy answer button smoke test
// ---------------------------------------------------------------------------
describe('Copy answer button', () => {
  it('renders the Copy Analysis button', () => {
    renderPanel('A simple answer.');
    const btn = screen.getByRole('button', { name: /copy answer as markdown/i });
    expect(btn).not.toBeNull();
  });
});
