import re
xml = open('d:/Cursor/testProject/_scope_lingxiu_build/word/document.xml', encoding='utf-8').read()
for pat in ['功能清单', '2.功能清单', '314F74B7', '47968128', '需求说明']:
    print(pat, xml.find(pat))
idx = xml.find('功能清单')
print(xml[idx-800:idx+200])
print('---')
print(xml[136800:137200])
