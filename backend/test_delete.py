import requests

# 登录获取 token
login_response = requests.post('http://localhost:8000/api/login', data={
    'username': '3012127489@qq.com',
    'password': '123456'
})
token = login_response.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# 测试删除活动 ID=9
activity_id = 9
response = requests.delete(f'http://localhost:8000/api/activities/{activity_id}', headers=headers)
print(f'Delete Status: {response.status_code}')
print(f'Response: {response.text}')

# 再次获取活动列表
my_activities = requests.get('http://localhost:8000/api/my-activities', headers=headers)
print(f'\nRemaining activities: {len(my_activities.json())}')
for act in my_activities.json():
    print(f"  {act['id']} - {act['title']}")
