import urllib.request, json
url = 'https://restcountries.com/v3.1/all?fields=name,cca2,idd'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
response = urllib.request.urlopen(req)
data = json.loads(response.read().decode())

codes = []
for c in data:
    if 'idd' in c and 'root' in c['idd']:
        root = c['idd'].get('root', '')
        suffixes = c['idd'].get('suffixes', [])
        if not suffixes:
            code = root
        elif len(suffixes) == 1:
            code = root + suffixes[0]
        else:
            code = root # For countries like US with many +1 suffixes, just use +1
        
        # calculate flag emoji from cca2
        cca2 = c.get('cca2', '')
        if len(cca2) == 2:
            flag = chr(ord(cca2[0]) + 127397) + chr(ord(cca2[1]) + 127397)
            name = c['name']['common']
            if code:
                # avoid duplicates, just use the first match
                if not any(x['name'] == name for x in codes):
                    codes.append({'code': code, 'name': name, 'flag': flag})

# sort by name
codes.sort(key=lambda x: x['name'])

# Generate TS code
ts_code = '\nexport const COUNTRY_CODES = [\n'
for c in codes:
    ts_code += f'  {{ code: "{c["code"]}", label: "{c["flag"]} {c["code"]}", name: "{c["name"]}" }},\n'
ts_code += '];\n'

with open('src/data.ts', 'a', encoding='utf-8') as f:
    f.write(ts_code)

print('Appended COUNTRY_CODES to src/data.ts')
