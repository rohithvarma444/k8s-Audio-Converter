import os,requests

def login(request):
    auth = request.authorization

    if not auth:
        return None,("missing credentials",401)
    
    basicAuth = (auth.username, auth.password)
    response = requests.post(
        f"http://{os.environ.get('AUTH_SVC_ADDRESS')}/login",
        auth=basicAuth
    )

    if response.status_code == 200:
        return response.text
    else:
        return None, (response.text, response.status_code)

def register(request):
    data = request.get_json()
    
    if not data or not "email" in data or not "password" in data:
        return None, ("missing credentials", 400)
    
    response = requests.post(
        f"http://{os.environ.get('AUTH_SVC_ADDRESS')}/register",
        json=data
    )
    
    if response.status_code == 201:
        return response.text, None
    else:
        return None, (response.text, response.status_code)
