# docs-app

Journium documentation site built with [Fumadocs](https://fumadocs.vercel.app/) and Next.js.

---

## Research Papers (LaTeX / PDF)

LaTeX source files for research papers live in `tex/`. Compiled PDFs are output to the same directory.

### Prerequisites — Installing pdflatex (macOS)

Install [MacTeX](https://www.tug.org/mactex/) via Homebrew Cask. This installs the full TeX Live distribution including `pdflatex`, `bibtex`, and all standard packages.

```bash
brew install --cask mactex
```

After installation, open a **new terminal** (or reload your shell) so that `/Library/TeX/texbin` is on your `PATH`:

```bash
export PATH="/Library/TeX/texbin:$PATH"
```

Verify:

```bash
pdflatex --version
# pdfTeX, Version 3.141592653-... (TeX Live 2026)
```

> MacTeX is a large download (~4 GB). A smaller alternative is BasicTeX (`brew install --cask basictex`), but it omits some packages used by these papers.

---

### Compiling a Paper to PDF

LaTeX requires **two passes** to resolve cross-references (`\ref{}`, `\label{}`), the table of contents, and equation numbers. Running it once will produce `??` placeholders — always run twice.

```bash
cd apps/docs-app/tex
pdflatex behavioral_intelligence_platform.tex
pdflatex behavioral_intelligence_platform.tex
```

The second pass reads the `.aux` file written by the first pass to fill in all references. The output PDF is written to the same directory:

```
tex/behavioral_intelligence_platform.pdf
```

#### Auxiliary files

The compiler produces several files alongside the PDF:

| File | Purpose |
|---|---|
| `.aux` | Cross-reference data — read on second pass |
| `.toc` | Table of contents entries |
| `.out` | Hyperref bookmark data |
| `.log` | Full compiler transcript — check here for errors |

These are build artifacts and do not need to be committed.

#### Checking for errors

To see only warnings and errors during compilation:

```bash
pdflatex -interaction=nonstopmode behavioral_intelligence_platform.tex \
  | grep -E "^!|Overfull|Underfull|Warning.*label"
```

A clean build produces no output from that grep. The two harmless messages below appear on every pass and can be ignored:

```
==> First Aid for listings.sty no longer applied!
Couldn't patch \deferred@thm@head!
```

---

### Editing the LaTeX Source

The source file is:

```
tex/behavioral_intelligence_platform.tex
```

#### Document structure

```
\title{...}           % Paper title (supports \\ line breaks)
\author{...}          % Author block — see below
\date{...}            % Date and submission note

\begin{abstract}      % Abstract + Keywords
\tableofcontents      % Auto-generated from \section commands
\section{...}         % Top-level sections (numbered)
\subsection{...}      % Subsections
\subsubsection{...}   % Sub-subsections
\begin{thebibliography}{99}  % Reference list at end
```

#### Author block

Authors are separated by `\and`. Each block has three lines: name, affiliation, email.

```latex
\author{%
  Author One \\
  \normalsize Affiliation \\
  \normalsize \texttt{email@example.com}
  \and
  Author Two \\
  \normalsize Affiliation \\
  \normalsize \texttt{email@example.com}
}
```

#### Math

Display equations use `\begin{equation}...\end{equation}` (numbered) or `\[...\]` (unnumbered). Inline math uses `$...$`.

Equation labels and cross-references:

```latex
\begin{equation}
  N = (I - Q)^{-1}
  \label{eq:fundamental}
\end{equation}

% Reference it in text:
as shown in Equation~\ref{eq:fundamental}
```

#### Code / verbatim blocks

Architecture diagrams and structured examples use `lstlisting`:

```latex
\begin{lstlisting}
  Event Stream
      |
      v
  +------------------+
  |  Layer 1: ...    |
  +------------------+
\end{lstlisting}
```

#### Cross-references to sections

```latex
\section{Introduction}
\label{sec:intro}

% Reference in text:
as described in Section~\ref{sec:intro}
```

Always recompile twice after adding or renaming a `\label`.

#### Citations

Citations use `\cite{key}` and are defined in `\begin{thebibliography}`:

```latex
% In text:
as shown by Kemeny and Snell~\cite{kemeny1960}

% In reference list:
\bibitem{kemeny1960}
Kemeny, J.G. and Snell, J.L. (1960).
\textit{Finite Markov Chains}. Van Nostrand.
```

---

### Papers in this project

| File | Title |
|---|---|
| `tex/behavioral_intelligence_platform.tex` | Behavioral Intelligence Platforms: From Event Streams to Autonomous Insight |

---

## Web Documentation (Fumadocs)

The main docs site content lives in `content/docs/` and blog posts in `content/blog/`. Both support MDX with math rendering via `remark-math` + `rehype-katex` (KaTeX).

To run the docs dev server:

```bash
pnpm dev
```
