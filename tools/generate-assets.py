"""Resumable, budget-bounded, development-only image queue. Default: dry run.
Python 3.10+. No third party modules. Never include keys in browser code.
Primary optional env: IMAGE_PRIMARY_URL, IMAGE_PRIMARY_MODEL, IMAGE_PRIMARY_KEY.
Fallback: XAI_API_KEY + XAI_IMAGE_MODEL (default grok-imagine-image).
Endpoints must expose OpenAI-compatible image generation requests. Provider billing
is independent of ChatGPT/Grok consumer subscriptions. No automatic chat takeover.
"""
import argparse, base64, hashlib, json, os, pathlib, time, urllib.request, urllib.error
ROOT=pathlib.Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--execute',action='store_true');p.add_argument('--max-requests',type=int,default=4);p.add_argument('--max-cost-usd',type=float,default=1.0);p.add_argument('--estimated-cost-per-request',type=float,default=.10);args=p.parse_args()
if args.max_requests<1 or args.max_cost_usd<=0 or args.estimated_cost_per_request<=0:p.error('Budget values must be positive')
queue=json.loads((ROOT/'tools/asset-queue.json').read_text(encoding='utf-8'))
state_path=ROOT/'tools/asset-state.json'
state=json.loads(state_path.read_text()) if state_path.exists() else {'jobs':{},'requests':0}
def persist():
    temp=state_path.with_suffix('.tmp');temp.write_text(json.dumps(state,indent=2),encoding='utf-8');temp.replace(state_path)
providers=[]
if os.getenv('IMAGE_PRIMARY_URL') and os.getenv('IMAGE_PRIMARY_KEY') and os.getenv('IMAGE_PRIMARY_MODEL'):
    providers.append((os.environ['IMAGE_PRIMARY_URL'],os.environ['IMAGE_PRIMARY_MODEL'],os.environ['IMAGE_PRIMARY_KEY']))
if os.getenv('XAI_API_KEY'):providers.append(('https://api.x.ai/v1/images/generations',os.getenv('XAI_IMAGE_MODEL','grok-imagine-image'),os.environ['XAI_API_KEY']))
if args.execute and not providers:raise SystemExit('No provider configured. Set XAI_API_KEY on the development machine, never in the website.')
requests=0
for job in queue['jobs']:
    out=(ROOT/'dist'/job['output']).resolve()
    if not out.is_relative_to((ROOT/'dist/assets').resolve()):raise SystemExit('Unsafe output path')
    digest=hashlib.sha256(job['prompt'].encode()).hexdigest()
    previous=state['jobs'].get(job['id'],{})
    if previous.get('hash')==digest and previous.get('status')=='complete' and out.exists():print('CACHED',job['id']);continue
    if not args.execute:print('PLANNED',job['id'],'->',job['output']);continue
    if previous.get('status') in ('inflight','uncertain'):print('REVIEW REQUIRED before retry:',job['id']);continue
    errors=[]
    for endpoint,model,key in providers:
        if requests>=args.max_requests or (requests+1)*args.estimated_cost_per_request>args.max_cost_usd:print('Budget boundary reached. Remaining jobs preserved.');raise SystemExit(0)
        if not endpoint.startswith('https://'):raise SystemExit('HTTPS provider URL required')
        requests+=1;state['requests']+=1;state['jobs'][job['id']]={'hash':digest,'status':'inflight','model':model};persist()
        payload={'model':model,'prompt':job['prompt'],'n':1,'response_format':'b64_json'}
        request=urllib.request.Request(endpoint,json.dumps(payload).encode(),{'Authorization':'Bearer '+key,'Content-Type':'application/json'})
        try:
            with urllib.request.urlopen(request,timeout=150) as response:data=json.load(response)
            item=data['data'][0]
            if item.get('b64_json'):blob=base64.b64decode(item['b64_json'],validate=True)
            else:
                url=item['url']
                if not url.startswith('https://'):raise ValueError('Non-HTTPS image URL')
                with urllib.request.urlopen(url,timeout=60) as response:blob=response.read(25000001)
            if len(blob)>25000000:raise ValueError('Image too large')
            if not (blob.startswith(b'\x89PNG') or blob.startswith(b'\xff\xd8\xff') or blob[:4]==b'RIFF'):raise ValueError('Unrecognized raster format')
            out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(blob)
            state['jobs'][job['id']]={'hash':digest,'status':'complete','model':model,'bytes':len(blob),'needs_visual_review':True};persist();print('GENERATED — review before integration:',job['id']);break
        except urllib.error.HTTPError as error:
            errors.append('HTTP '+str(error.code));state['jobs'][job['id']]['status']='failed';state['jobs'][job['id']]['error']=errors[-1];persist()
            if error.code not in (429,502,503,504):break
        except Exception as error:
            state['jobs'][job['id']]['status']='uncertain';state['jobs'][job['id']]['error']=type(error).__name__;persist();print('Request outcome uncertain; stopped to avoid duplicate billing:',job['id']);break
    else:print('No provider succeeded:',job['id'])
print('Done. Actual billed cost depends on provider; the cost boundary uses the estimate supplied.')
