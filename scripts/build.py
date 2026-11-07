#!/usr/bin/env python3
"""Assemble index.html from src/ and data/ (single-file game)."""
import pathlib
root=pathlib.Path(__file__).resolve().parent.parent
src=root/'src';r=lambda p:(src/p).read_text(encoding='utf-8')
js=''.join(r(f) for f in ['s1.js','s2.js','s5.js','s6.js','s4.js','s3.js'])
land=(root/'data'/'land.js').read_text(encoding='utf-8')
html=r('head.html')+r('body.html')+'\n<script>\n'+land+'\n</script>\n<script>\n'+js+'\n</script>\n</body>\n</html>\n'
(root/'index.html').write_text(html,encoding='utf-8');print('index.html',len(html),'bytes')
