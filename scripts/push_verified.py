#!/usr/bin/env python3
import sys, os, subprocess, base64, json, time, requests
try:
    import jwt
    def get_jwt(app_id, private_key):
        now = int(time.time())
        return jwt.encode({'iat': now - 60, 'exp': now + 600, 'iss': app_id}, private_key, algorithm='RS256')
except ImportError:
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.asymmetric import padding
    from cryptography.hazmat.primitives.serialization import load_pem_private_key
    def get_jwt(app_id, private_key):
        def b64url(data):
            if isinstance(data, str): data = data.encode('utf-8')
            return base64.urlsafe_b64encode(data).rstrip(b'=').decode('ascii')
        now = int(time.time())
        h_b64 = b64url(json.dumps({'alg': 'RS256', 'typ': 'JWT'}))
        p_b64 = b64url(json.dumps({'iat': now - 60, 'exp': now + 600, 'iss': app_id}))
        signing_input = f"{h_b64}.{p_b64}".encode('ascii')
        key = load_pem_private_key(private_key.encode('utf-8'), password=None)
        sig = key.sign(signing_input, padding.PKCS1v15(), hashes.SHA256())
        return f"{h_b64}.{p_b64}.{b64url(sig)}"


BRANCH = subprocess.check_output(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], text=True).strip()
REPO = 'Antigravi-ty/SimpleUI'
APP_ID = '4938122'
INSTALLATION_ID = '161556943'
PRIVATE_KEY_PATH = '/tmp/gh_key.pem'

def get_installation_token():
    with open(PRIVATE_KEY_PATH) as f:
        private_key = f.read()
    now = int(time.time())
    token = get_jwt(APP_ID, private_key)
    headers = {'Authorization': f'Bearer {token}', 'Accept': 'application/vnd.github+json'}
    resp = requests.post(f'https://api.github.com/app/installations/{INSTALLATION_ID}/access_tokens', headers=headers)
    resp.raise_for_status()
    return resp.json()['token']

def get_git_status(path_prefixes=None):
    status_output = subprocess.check_output(['git', 'status', '--porcelain', '-uall'], text=True)
    additions = []
    deletions = []
    
    for line in status_output.splitlines():
        if not line.strip():
            continue
        status = line[:2]
        path = line[3:].strip()
        if ' -> ' in path:
            path = path.split(' -> ')[1]
            
        if path == '.git' or path.startswith('.git/') or path.startswith('node_modules') or path.startswith('dist') or path.endswith('.pyc') or '__pycache__' in path:
            continue
            
        if path_prefixes:
            matched = False
            for p in path_prefixes:
                p = p.strip()
                if path == p or path.startswith(p if p.endswith('/') else p + '/'):
                    matched = True
                    break
            if not matched:
                continue

        if 'D' in status:
            deletions.append({'path': path})
        else:
            if os.path.exists(path):
                with open(path, 'rb') as f:
                    content_b64 = base64.b64encode(f.read()).decode('utf-8')
                additions.append({'path': path, 'contents': content_b64})
            else:
                deletions.append({'path': path})
    return additions, deletions

def main():
    if len(sys.argv) < 2:
        print("Usage: push_verified.py '<commit_headline>' ['<commit_body>'] [--paths=p1,p2]")
        sys.exit(1)
        
    headline = sys.argv[1]
    body = ""
    path_prefixes = None
    
    for arg in sys.argv[2:]:
        if arg.startswith('--paths='):
            path_prefixes = arg.split('=', 1)[1].split(',')
        elif not body:
            body = arg

    full_body = f"{body}\n\nCo-authored-by: Mark <29165094+MaBoCoMark@users.noreply.github.com>".strip()

    additions, deletions = get_git_status(path_prefixes)
    if not additions and not deletions:
        print("No changes detected in working tree for specified paths.")
        return

    print(f"Committing {len(additions)} addition(s) and {len(deletions)} deletion(s)...")
    token = get_installation_token()
    
    # Get current branch HEAD OID, or create branch if missing
    r = requests.get(f'https://api.github.com/repos/{REPO}/git/ref/heads/{BRANCH}', headers={'Authorization': f'token {token}'})
    if r.status_code == 404:
        parent_sha = subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()
        ref_resp = requests.post(
            f'https://api.github.com/repos/{REPO}/git/refs',
            headers={'Authorization': f'token {token}'},
            json={'ref': f'refs/heads/{BRANCH}', 'sha': parent_sha}
        )
        ref_resp.raise_for_status()
        head_oid = parent_sha
        print(f"Created remote branch '{BRANCH}' at {head_oid[:8]}")
    else:
        r.raise_for_status()
        head_oid = r.json()['object']['sha']
    
    mutation = '''
    mutation CreateCommit($input: CreateCommitOnBranchInput!) {
      createCommitOnBranch(input: $input) {
        commit {
          oid
          message
          signature {
            isValid
            signer { login }
          }
        }
      }
    }
    '''
    file_changes = {}
    if additions:
        file_changes['additions'] = additions
    if deletions:
        file_changes['deletions'] = deletions
        
    variables = {
        'input': {
            'branch': {
                'repositoryNameWithOwner': REPO,
                'branchName': BRANCH
            },
            'message': {
                'headline': headline,
                'body': full_body
            },
            'fileChanges': file_changes,
            'expectedHeadOid': head_oid
        }
    }
    
    res = requests.post(
        'https://api.github.com/graphql',
        json={'query': mutation, 'variables': variables},
        headers={'Authorization': f'Bearer {token}'}
    )
    data = res.json()
    if 'errors' in data:
        print("GraphQL Errors:", data['errors'])
        sys.exit(1)
        
    new_commit = data['data']['createCommitOnBranch']['commit']
    new_oid = new_commit['oid']
    sig = new_commit['signature']
    print(f"Committed and pushed successfully: {new_oid[:8]} (Signed: {sig.get('isValid')})")
    
    # Sync local git repo
    subprocess.run(['git', 'fetch', 'origin', BRANCH], check=True)
    subprocess.run(['git', 'reset', f'origin/{BRANCH}'], check=True)
    print("Local git working tree synced.")

if __name__ == '__main__':
    main()
