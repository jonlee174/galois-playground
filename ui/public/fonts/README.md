# Modern No. 20

The UI is set in Modern No. 20 (Regular; the face has no bold). The font ships
with Microsoft Office and isn't redistributable, so font files in this
directory are gitignored.

The UI picks it up if either:

- it's installed system-wide (CSS `local("Modern No. 20")`), or
- the file is copied here as `ModernNo20.ttf`. On a Mac with Office installed:

  ```bash
  cp "/Applications/Microsoft Word.app/Contents/Resources/DFonts/ModernNo.20.ttf" ui/public/fonts/ModernNo20.ttf
  ```

Without it the UI falls back to Georgia.
