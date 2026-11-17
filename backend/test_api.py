import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from rest_framework.test import APIClient

client = APIClient()

print("Testing POST /api/auth/login/...")
res = client.post('/api/auth/login/', {'email': 'yuvan@example.com', 'password': 'password123'})
print("Login status:", res.status_code)
assert res.status_code == 200, res.data
token = res.data['access']
print("User logged in:", res.data['user']['first_name'])

client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)

print("\nTesting GET /api/dashboard/summary/?month=2025-07...")
res2 = client.get('/api/dashboard/summary/?month=2025-07')
print("Dashboard status:", res2.status_code)
assert res2.status_code == 200, res2.data
cards = res2.data['summary_cards']
print("Total Balance:", cards['total_balance'])
print("Total Income:", cards['total_income'])
print("Total Expenses:", cards['total_expenses'])
print("Monthly Budget:", cards['monthly_budget'])

print("\nCategories in Expense Overview:")
for cat in res2.data['expense_overview']['categories']:
    print(f"  {cat['name']}: ₹{cat['amount']} ({cat['percentage']}%)")

print("\nRecent Transactions:")
for tx in res2.data['recent_transactions']:
    print(f"  {tx['date']} | {tx['description']} | {tx['category_name']} | ₹{tx['amount']} | {tx['type']}")

print("\nTesting GET /api/budget/?month=2025-07...")
b_res = client.get('/api/budget/?month=2025-07')
print("Budget status:", b_res.status_code)
print("Budget amount:", b_res.data['amount'], "Used %:", b_res.data['used_percentage'])

print("\nTesting GET /api/reports/?from=2025-07-01&to=2025-07-31...")
r_res = client.get('/api/reports/?from=2025-07-01&to=2025-07-31')
print("Reports status:", r_res.status_code)
print("Report tx count:", r_res.data['transaction_count'], "Total expense:", r_res.data['total_expense'])

print("\nALL BACKEND API TESTS PASSED!")
