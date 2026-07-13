# Docstrings
## Language
- Write all docstrings in English. Do not mix languages in the same docstring.
- Use full words where it stays readable. Prefer `parameter` over `param`, `returns` is fine as a section label if your style guide uses it.
- Avoid chains of abbreviations. If you use a short form once, the reader should still understand without a glossary.
## Length
- One or two short sentences are enough for simple functions.
- Add more only when the behavior is not obvious from the name and types. Do not repeat the signature or restate obvious facts.
## Characters and formatting
- Prefer plain ASCII in docstrings. Avoid decorative punctuation, emoji, and fancy quotes.
- Use standard triple double quotes for Python docstrings. No need for banners or separator lines made of symbols.
## Example
Good:
```python
def merge_configs(base: dict, override: dict) -> dict:
    """Return a new dictionary with keys from base updated by override."""