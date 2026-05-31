import requests

# Login to get token
login_response = requests.post('http://localhost:8000/api/login', data={
    'username': '3012127489@qq.com',
    'password': '123456'
})
token = login_response.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# Test getting my activities
print('=== My Activities ===')
my_activities = requests.get('http://localhost:8000/api/my-activities', headers=headers)
print(f'Status: {my_activities.status_code}')
data = my_activities.json()
print(f'Count: {len(data)}')
for act in data:
    print(f"  ID: {act['id']} | Title: {act['title']} | Status: {act['status']}")
