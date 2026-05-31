import requests

# 登录获取 token
login_response = requests.post('http://localhost:8000/api/login', data={
    'username': '3012127489@qq.com',
    'password': '123456'
})
token = login_response.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

print('=== 我的发布 ===')
my_activities = requests.get('http://localhost:8000/api/my-activities', headers=headers)
print(f'状态码: {my_activities.status_code}')
data = my_activities.json()
print(f'活动数量: {len(data)}')
for act in data:
    print(f"  - {act['title']} (状态: {act['status']})")

print('\n=== 活动广场 ===')
activities = requests.get('http://localhost:8000/api/activities?status=open')
print(f'状态码: {activities.status_code}')
data = activities.json()
if isinstance(data, dict) and 'list' in data:
    print(f"活动数量: {data.get('count', 0)}")
    for act in data['list']:
        print(f"  - {act['title']} (状态: {act['status']})")
else:
    print(f"活动数量: {len(data)}")
    for act in data:
        print(f"  - {act['title']} (状态: {act['status']})")
