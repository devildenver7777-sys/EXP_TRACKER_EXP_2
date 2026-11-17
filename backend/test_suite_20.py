import os
import sys
import time
import json
from decimal import Decimal

# Configure Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from tracker.models import Category, Transaction, MonthlyBudget, UserProfile

class TestRunner20:
    def __init__(self):
        self.client = APIClient()
        self.results = []
        self.token = None
        self.user = None

    def record(self, tc_id, title, category, passed, details, duration_ms):
        self.results.append({
            'id': tc_id,
            'title': title,
            'category': category,
            'status': 'PASS' if passed else 'FAIL',
            'details': details,
            'duration_ms': round(duration_ms, 2)
        })

    def run_all(self):
        print("=" * 80)
        print(" RUNNING 20 COMPREHENSIVE TEST CASES FOR EXPENSE TRACKER APP")
        print("=" * 80)

        # Setup test database state
        self.setup_data()

        # Group 1: Authentication & Authorization (TC-01 to TC-05)
        self.tc_01_valid_login()
        self.tc_02_invalid_credentials()
        self.tc_03_account_lockout()
        self.tc_04_user_registration()
        self.tc_05_unauthorized_access_control()

        # Group 2: Dashboard & Summary Calculations (TC-06 to TC-10)
        self.tc_06_dashboard_total_expenses()
        self.tc_07_dashboard_total_balance()
        self.tc_08_budget_percentage_calculation()
        self.tc_09_expense_overview_categories()
        self.tc_10_spending_trend_structure()

        # Group 3: Transaction Management (TC-11 to TC-13)
        self.tc_11_add_expense_transaction()
        self.tc_12_add_income_transaction()
        self.tc_13_transaction_validation()

        # Group 4: Budget Management & Warning Alerts (TC-14 to TC-16)
        self.tc_14_get_monthly_budget()
        self.tc_15_update_monthly_budget()
        self.tc_16_budget_80_percent_warning()

        # Group 5: Reports, Filtering & CSV Export (TC-17 to TC-18)
        self.tc_17_reports_filtering()
        self.tc_18_csv_export_format()

        # Group 6: User Profile & Security Settings (TC-19 to TC-20)
        self.tc_19_update_profile_settings()
        self.tc_20_change_password()

        self.print_summary()

    def setup_data(self):
        # Reset DB for tests
        Transaction.objects.all().delete()
        Category.objects.all().delete()
        MonthlyBudget.objects.all().delete()
        UserProfile.objects.all().delete()
        User.objects.all().delete()

        # Create primary test user
        self.user = User.objects.create_user(
            username='yuvan',
            email='yuvan@example.com',
            password='password123',
            first_name='Yuvan',
            last_name=''
        )
        UserProfile.objects.create(user=self.user, currency='₹')

        # Create standard categories
        self.cat_food = Category.objects.create(name='Food', type='expense', color='#3b82f6')
        self.cat_shopping = Category.objects.create(name='Shopping', type='expense', color='#f97316')
        self.cat_travel = Category.objects.create(name='Travel', type='expense', color='#10b981')
        self.cat_bills = Category.objects.create(name='Bills', type='expense', color='#8b5cf6')
        self.cat_others = Category.objects.create(name='Others', type='expense', color='#eab308')
        self.cat_income = Category.objects.create(name='Income', type='income', color='#10b981')

        # Create July 2025 Budget matching SRS
        MonthlyBudget.objects.create(
            user=self.user,
            month='2025-07',
            amount=Decimal('15000.00'),
            category_budgets={
                'Food': 5000,
                'Shopping': 3000,
                'Travel': 2500,
                'Bills': 2500,
                'Others': 2000,
            }
        )

        # Seed initial July transactions
        Transaction.objects.create(user=self.user, type='income', category=self.cat_income, amount=Decimal('25000.00'), description='Salary', date='2025-07-17')
        Transaction.objects.create(user=self.user, type='expense', category=self.cat_food, amount=Decimal('450.00'), description='Zomato Order', date='2025-07-19')
        Transaction.objects.create(user=self.user, type='expense', category=self.cat_shopping, amount=Decimal('1299.00'), description='Amazon Purchase', date='2025-07-18')
        Transaction.objects.create(user=self.user, type='expense', category=self.cat_travel, amount=Decimal('200.00'), description='Metro Card', date='2025-07-15')
        Transaction.objects.create(user=self.user, type='expense', category=self.cat_bills, amount=Decimal('1800.00'), description='Electricity Bill', date='2025-07-14')

        # Additional expenses to complete July totals
        Transaction.objects.create(user=self.user, type='expense', category=self.cat_food, amount=Decimal('3550.00'), description='Groceries & Dining', date='2025-07-10')
        Transaction.objects.create(user=self.user, type='expense', category=self.cat_shopping, amount=Decimal('1201.00'), description='Sneakers', date='2025-07-08')
        Transaction.objects.create(user=self.user, type='expense', category=self.cat_travel, amount=Decimal('1800.00'), description='Flight Ticket', date='2025-07-04')
        Transaction.objects.create(user=self.user, type='expense', category=self.cat_bills, amount=Decimal('200.00'), description='Phone Recharge', date='2025-07-02')
        Transaction.objects.create(user=self.user, type='expense', category=self.cat_others, amount=Decimal('2050.00'), description='Entertainment & Books', date='2025-07-06')

    # TC-01: Valid User Login (FR-1.3, FR-1.6, AC-1)
    def tc_01_valid_login(self):
        t0 = time.time()
        res = self.client.post('/api/auth/login/', {'email': 'yuvan@example.com', 'password': 'password123'})
        dt = (time.time() - t0) * 1000

        passed = (
            res.status_code == status.HTTP_200_OK and
            'access' in res.data and
            'refresh' in res.data and
            res.data['user']['first_name'] == 'Yuvan'
        )
        if passed:
            self.token = res.data['access']
            self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        self.record('TC-01', 'Valid User Login & JWT Token Exchange', 'Authentication', passed,
                    f"Status {res.status_code}, User: {res.data.get('user', {}).get('first_name')}", dt)

    # TC-02: Invalid Credentials (FR-1.4)
    def tc_02_invalid_credentials(self):
        t0 = time.time()
        client = APIClient()
        res = client.post('/api/auth/login/', {'email': 'yuvan@example.com', 'password': 'wrongpassword'})
        dt = (time.time() - t0) * 1000

        passed = (
            res.status_code == status.HTTP_401_UNAUTHORIZED and
            res.data.get('detail') == 'Invalid email or password.'
        )
        self.record('TC-02', 'Invalid Credentials Generic Error', 'Authentication', passed,
                    f"Status {res.status_code}, Detail: '{res.data.get('detail')}'", dt)

    # TC-03: Account Lockout after 5 Failed Attempts (FR-1.5)
    def tc_03_account_lockout(self):
        t0 = time.time()
        client = APIClient()
        # 5 failed attempts
        for _ in range(5):
            client.post('/api/auth/login/', {'email': 'yuvan@example.com', 'password': 'bad'})

        # 6th attempt with correct password should be locked
        res = client.post('/api/auth/login/', {'email': 'yuvan@example.com', 'password': 'password123'})
        dt = (time.time() - t0) * 1000

        passed = (
            res.status_code == status.HTTP_403_FORBIDDEN and
            'locked' in res.data.get('detail', '').lower()
        )
        # Unlock account for subsequent tests
        p = UserProfile.objects.get(user=self.user)
        p.failed_login_attempts = 0
        p.locked_until = None
        p.save()

        self.record('TC-03', 'Account Lockout after 5 Failed Logins', 'Security', passed,
                    f"Status {res.status_code}, Message: '{res.data.get('detail')}'", dt)

    # TC-04: User Registration (FR-1.1, Section 2.3)
    def tc_04_user_registration(self):
        t0 = time.time()
        client = APIClient()
        res = client.post('/api/auth/register/', {
            'name': 'Rahul Sharma',
            'email': 'rahul@example.com',
            'password': 'password123'
        })
        dt = (time.time() - t0) * 1000

        passed = (
            res.status_code == status.HTTP_201_CREATED and
            res.data['user']['first_name'] == 'Rahul' and
            'access' in res.data
        )
        self.record('TC-04', 'User Registration & Initial Setup', 'Authentication', passed,
                    f"Status {res.status_code}, Registered: {res.data.get('user', {}).get('first_name')}", dt)

    # TC-05: Unauthorized Access Control (FR-3.1, AC-5)
    def tc_05_unauthorized_access_control(self):
        t0 = time.time()
        unauth_client = APIClient()
        res = unauth_client.get('/api/dashboard/summary/?month=2025-07')
        dt = (time.time() - t0) * 1000

        passed = (res.status_code == status.HTTP_401_UNAUTHORIZED)
        self.record('TC-05', 'Unauthenticated Access Blocked (401)', 'Authorization', passed,
                    f"Status {res.status_code} on protected endpoint", dt)

    # TC-06: Dashboard Total Expenses Sum (AC-2, FR-2.3)
    def tc_06_dashboard_total_expenses(self):
        t0 = time.time()
        res = self.client.get('/api/dashboard/summary/?month=2025-07')
        dt = (time.time() - t0) * 1000

        total_exp = res.data['summary_cards']['total_expenses']['amount']
        # 450 + 1299 + 200 + 1800 + 3550 + 1201 + 1800 + 200 + 2050 = 12550
        passed = (res.status_code == status.HTTP_200_OK and total_exp == 12550.0)
        self.record('TC-06', 'Dashboard Total Expenses Match DB Sum', 'Dashboard', passed,
                    f"Total Expenses: ₹{total_exp} (Expected: ₹12,550.0)", dt)

    # TC-07: Dashboard Total Balance Calculation (FR-2.3)
    def tc_07_dashboard_total_balance(self):
        t0 = time.time()
        res = self.client.get('/api/dashboard/summary/?month=2025-07')
        dt = (time.time() - t0) * 1000

        income = res.data['summary_cards']['total_income']['amount']
        expenses = res.data['summary_cards']['total_expenses']['amount']
        balance = res.data['summary_cards']['total_balance']['amount']

        passed = (balance == (income - expenses) and balance == 12450.0)
        self.record('TC-07', 'Dashboard Total Balance = Income - Expenses', 'Dashboard', passed,
                    f"Balance: ₹{balance} = ₹{income} - ₹{expenses} (₹12,450.0)", dt)

    # TC-08: Monthly Budget Used Percentage & Rounding (AC-4, FR-2.4)
    def tc_08_budget_percentage_calculation(self):
        t0 = time.time()
        res = self.client.get('/api/dashboard/summary/?month=2025-07')
        dt = (time.time() - t0) * 1000

        budget = res.data['summary_cards']['monthly_budget']['amount']
        expenses = res.data['summary_cards']['total_expenses']['amount']
        pct = res.data['summary_cards']['monthly_budget']['percentage_used']

        # 12550 / 15000 = 83.666% -> rounds to 84%
        expected_pct = round((expenses / budget) * 100)
        passed = (budget == 15000.0 and pct == 84 and pct == expected_pct)
        self.record('TC-08', 'Budget Used Percentage Calculation (84%)', 'Dashboard', passed,
                    f"Budget: ₹{budget}, Used: {pct}% (Expected: 84%)", dt)

    # TC-09: Expense Overview Category Breakdown (FR-2.5)
    def tc_09_expense_overview_categories(self):
        t0 = time.time()
        res = self.client.get('/api/dashboard/summary/?month=2025-07')
        dt = (time.time() - t0) * 1000

        cats = {c['name']: c['amount'] for c in res.data['expense_overview']['categories']}
        # Expected: Food 4000, Shopping 2500, Travel 2000, Bills 2000, Others 2050
        passed = (
            cats.get('Food') == 4000.0 and
            cats.get('Shopping') == 2500.0 and
            cats.get('Travel') == 2000.0 and
            cats.get('Bills') == 2000.0 and
            cats.get('Others') == 2050.0
        )
        self.record('TC-09', 'Expense Overview 5-Category Breakdown', 'Dashboard', passed,
                    f"Food: ₹{cats.get('Food')}, Shop: ₹{cats.get('Shopping')}, Travel: ₹{cats.get('Travel')}, Bills: ₹{cats.get('Bills')}", dt)

    # TC-10: Spending Trend 7 Months Structure (FR-2.6)
    def tc_10_spending_trend_structure(self):
        t0 = time.time()
        res = self.client.get('/api/dashboard/summary/?month=2025-07')
        dt = (time.time() - t0) * 1000

        trend = res.data.get('spending_trend', [])
        months = [t['month'] for t in trend]
        jul_amount = next((t['amount'] for t in trend if t['month'] == 'Jul'), None)

        passed = (
            len(trend) == 7 and
            months == ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'] and
            jul_amount == 12550.0
        )
        self.record('TC-10', 'Spending Trend 7 Months Historical Points', 'Dashboard', passed,
                    f"7 Months: {', '.join(months)}, Jul total: ₹{jul_amount}", dt)

    # TC-11: Add Valid Expense Transaction (AC-3, FR-3.3)
    def tc_11_add_expense_transaction(self):
        t0 = time.time()
        res = self.client.post('/api/transactions/', {
            'type': 'expense',
            'category_name': 'Food',
            'amount': '350.00',
            'description': 'Subway Lunch',
            'date': '2025-07-20'
        })
        dt = (time.time() - t0) * 1000

        passed = (
            res.status_code == status.HTTP_201_CREATED and
            res.data['description'] == 'Subway Lunch' and
            float(res.data['amount']) == 350.0
        )
        self.record('TC-11', 'Add Valid Expense Transaction', 'Transactions', passed,
                    f"Status {res.status_code}, Tx ID: {res.data.get('id')}, Amount: ₹350.0", dt)

    # TC-12: Add Valid Income Transaction & Dynamic Update (FR-3.3)
    def tc_12_add_income_transaction(self):
        t0 = time.time()
        res = self.client.post('/api/transactions/', {
            'type': 'income',
            'category_name': 'Income',
            'amount': '5000.00',
            'description': 'Freelance Project',
            'date': '2025-07-21'
        })
        dt = (time.time() - t0) * 1000

        passed = (
            res.status_code == status.HTTP_201_CREATED and
            res.data['type'] == 'income' and
            float(res.data['amount']) == 5000.0
        )
        self.record('TC-12', 'Add Valid Income Transaction', 'Transactions', passed,
                    f"Status {res.status_code}, Type: {res.data.get('type')}, Amount: ₹5,000.0", dt)

    # TC-13: Validation Error on Invalid Amount (FR-3.3)
    def tc_13_transaction_validation(self):
        t0 = time.time()
        res = self.client.post('/api/transactions/', {
            'type': 'expense',
            'category_name': 'Food',
            'amount': '-100.00', # invalid negative amount
            'description': '',    # missing description
            'date': '2025-07-20'
        })
        dt = (time.time() - t0) * 1000

        # Should fail validation
        passed = (res.status_code == status.HTTP_400_BAD_REQUEST)
        self.record('TC-13', 'Transaction Validation on Invalid/Empty Fields', 'Transactions', passed,
                    f"Status {res.status_code} properly rejected invalid payload", dt)

    # TC-14: Fetch Monthly Budget & Category Limits (FR-3.3)
    def tc_14_get_monthly_budget(self):
        t0 = time.time()
        res = self.client.get('/api/budget/?month=2025-07')
        dt = (time.time() - t0) * 1000

        passed = (
            res.status_code == status.HTTP_200_OK and
            res.data['amount'] == 15000.0 and
            'category_budgets' in res.data and
            'category_spending' in res.data
        )
        self.record('TC-14', 'Fetch Monthly Budget & Spending Details', 'Budget', passed,
                    f"Status {res.status_code}, Budget: ₹{res.data.get('amount')}, Total Expenses: ₹{res.data.get('total_expenses')}", dt)

    # TC-15: Update Monthly Budget Amount (FR-2.8)
    def tc_15_update_monthly_budget(self):
        t0 = time.time()
        res = self.client.put('/api/budget/', {
            'month': '2025-07',
            'amount': 18000.00,
            'category_budgets': {'Food': 6000, 'Shopping': 4000}
        }, format='json')
        dt = (time.time() - t0) * 1000

        passed = (
            res.status_code == status.HTTP_200_OK and
            res.data['amount'] == 18000.0 and
            res.data['category_budgets'].get('Food') == 6000
        )
        # Restore to 15000 and standard category limits for subsequent tests
        self.client.put('/api/budget/', {
            'month': '2025-07',
            'amount': 15000.00,
            'category_budgets': {
                'Food': 5000,
                'Shopping': 3000,
                'Travel': 2500,
                'Bills': 2500,
                'Others': 2000,
            }
        }, format='json')

        self.record('TC-15', 'Update Monthly Budget Limit (PUT /api/budget/)', 'Budget', passed,
                    f"Status {res.status_code}, Updated to: ₹18,000.0", dt)

    # TC-16: 80% Threshold Warning on Category Budget (SRS Section 3.3)
    def tc_16_budget_80_percent_warning(self):
        t0 = time.time()
        res = self.client.get('/api/budget/?month=2025-07')
        dt = (time.time() - t0) * 1000

        spending = res.data.get('category_spending', {})
        budgets = res.data.get('category_budgets', {})

        warnings = []
        for cat, limit in budgets.items():
            spent = spending.get(cat, 0)
            if limit > 0 and (spent / limit) >= 0.8:
                warnings.append((cat, round((spent / limit) * 100)))

        # Food: 4000/5000 = 80%, Shopping: 2500/3000 = 83%, Others: 2050/2000 = 102%
        passed = len(warnings) >= 2
        self.record('TC-16', 'Budget 80% Limit Exceeded Threshold Alerts', 'Budget', passed,
                    f"Detected {len(warnings)} categories over 80%: {warnings}", dt)

    # TC-17: Reports Filtering by Date & Category (FR-3.3)
    def tc_17_reports_filtering(self):
        t0 = time.time()
        res = self.client.get('/api/reports/?from=2025-07-01&to=2025-07-31&category=Food')
        dt = (time.time() - t0) * 1000

        txs = res.data.get('transactions', [])
        all_food = all(t['category_name'].lower() == 'food' for t in txs)
        passed = (
            res.status_code == status.HTTP_200_OK and
            len(txs) >= 2 and
            all_food and
            'total_income' in res.data and
            'total_expense' in res.data
        )
        self.record('TC-17', 'Reports Filtering by Date Range & Category', 'Reports', passed,
                    f"Status {res.status_code}, Found {len(txs)} transactions strictly matching 'Food'", dt)

    # TC-18: Export Reports to CSV Format (FR-3.3)
    def tc_18_csv_export_format(self):
        t0 = time.time()
        res = self.client.get('/api/reports/?from=2025-07-01&to=2025-07-31&export=csv')
        dt = (time.time() - t0) * 1000

        content = res.content.decode('utf-8') if res.content else ''
        passed = (
            res.status_code == status.HTTP_200_OK and
            res['Content-Type'] == 'text/csv' and
            'Date,Description,Category,Amount (INR),Type' in content and
            'Zomato Order' in content
        )
        self.record('TC-18', 'Reports CSV Export Header & Record Generation', 'Reports', passed,
                    f"Status {res.status_code}, Content-Type: {res.get('Content-Type')}, Lines: {len(content.splitlines())}", dt)

    # TC-19: Update User Profile Settings (FR-3.3)
    def tc_19_update_profile_settings(self):
        t0 = time.time()
        res = self.client.patch('/api/auth/me/', {
            'first_name': 'Yuvan',
            'last_name': 'Dev',
            'currency': '₹'
        })
        dt = (time.time() - t0) * 1000

        passed = (
            res.status_code == status.HTTP_200_OK and
            res.data['first_name'] == 'Yuvan' and
            res.data['last_name'] == 'Dev' and
            res.data['currency'] == '₹'
        )
        self.record('TC-19', 'User Profile Update (Name, Currency Symbol)', 'Settings', passed,
                    f"Status {res.status_code}, Updated Name: {res.data.get('first_name')} {res.data.get('last_name')}", dt)

    # TC-20: Change Password Validation (FR-3.3)
    def tc_20_change_password(self):
        t0 = time.time()
        # Test wrong current password first
        res_fail = self.client.patch('/api/auth/me/', {
            'current_password': 'wrongpassword',
            'new_password': 'newpassword456'
        })

        # Test correct current password change
        res_ok = self.client.patch('/api/auth/me/', {
            'current_password': 'password123',
            'new_password': 'newpassword456'
        })
        dt = (time.time() - t0) * 1000

        passed = (
            res_fail.status_code == status.HTTP_400_BAD_REQUEST and
            res_ok.status_code == status.HTTP_200_OK
        )
        self.record('TC-20', 'Change Password Current Password Verification', 'Settings', passed,
                    f"Wrong password rejected (400), Valid change accepted (200)", dt)

    def print_summary(self):
        pass_count = sum(1 for r in self.results if r['status'] == 'PASS')
        fail_count = sum(1 for r in self.results if r['status'] == 'FAIL')

        print(f"\n{'ID':<7} | {'Category':<15} | {'Status':<6} | {'Time (ms)':<9} | {'Test Case Title':<40}")
        print("-" * 85)
        for r in self.results:
            print(f"{r['id']:<7} | {r['category']:<15} | {r['status']:<6} | {r['duration_ms']:<9} | {r['title']:<40}")

        print("=" * 85)
        print(f" TOTAL TEST CASES: {len(self.results)} | PASSED: {pass_count} | FAILED: {fail_count} | PASS RATE: {round((pass_count / len(self.results)) * 100)}%")
        print("=" * 85)

        # Output JSON result for automated consumption
        with open('test_results_20.json', 'w') as f:
            json.dump({
                'timestamp': timezone.now().isoformat(),
                'total': len(self.results),
                'passed': pass_count,
                'failed': fail_count,
                'pass_rate': f"{round((pass_count / len(self.results)) * 100)}%",
                'test_cases': self.results
            }, f, indent=2)

if __name__ == '__main__':
    runner = TestRunner20()
    runner.run_all()
