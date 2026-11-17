from datetime import date, timedelta
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from tracker.models import Category, Transaction, MonthlyBudget, UserProfile

class ExpenseTrackerBackendTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='yuvan',
            email='yuvan@example.com',
            password='password123',
            first_name='Yuvan'
        )
        self.profile = UserProfile.objects.create(user=self.user, currency='₹')

        # Create Categories
        self.cat_food = Category.objects.create(name='Food', type='expense')
        self.cat_shopping = Category.objects.create(name='Shopping', type='expense')
        self.cat_income = Category.objects.create(name='Income', type='income')

        # Create Budget
        self.budget = MonthlyBudget.objects.create(
            user=self.user,
            month='2025-07',
            amount=Decimal('15000.00'),
            category_budgets={'Food': 5000, 'Shopping': 3000}
        )

        # Create Transactions
        self.tx1 = Transaction.objects.create(
            user=self.user,
            type='expense',
            category=self.cat_food,
            amount=Decimal('450.00'),
            description='Zomato Order',
            date='2025-07-19'
        )
        self.tx2 = Transaction.objects.create(
            user=self.user,
            type='expense',
            category=self.cat_shopping,
            amount=Decimal('1299.00'),
            description='Amazon Purchase',
            date='2025-07-18'
        )
        self.tx3 = Transaction.objects.create(
            user=self.user,
            type='income',
            category=self.cat_income,
            amount=Decimal('25000.00'),
            description='Salary',
            date='2025-07-17'
        )

        # Authenticate client
        login_res = self.client.post('/api/auth/login/', {
            'email': 'yuvan@example.com',
            'password': 'password123'
        })
        self.token = login_res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_login_success(self):
        res = self.client.post('/api/auth/login/', {
            'email': 'yuvan@example.com',
            'password': 'password123'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        self.assertEqual(res.data['user']['first_name'], 'Yuvan')

    def test_login_invalid_password(self):
        res = self.client.post('/api/auth/login/', {
            'email': 'yuvan@example.com',
            'password': 'wrongpassword'
        })
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(res.data['detail'], 'Invalid email or password.')

    def test_account_lockout_after_5_failed_attempts(self):
        for _ in range(5):
            self.client.post('/api/auth/login/', {
                'email': 'yuvan@example.com',
                'password': 'wrong'
            })
        # 6th attempt should be locked
        res = self.client.post('/api/auth/login/', {
            'email': 'yuvan@example.com',
            'password': 'password123'
        })
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('locked', res.data['detail'].lower())

    def test_unauthenticated_request_blocked(self):
        unauth_client = APIClient()
        res = unauth_client.get('/api/dashboard/summary/?month=2025-07')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_dashboard_summary_metrics(self):
        res = self.client.get('/api/dashboard/summary/?month=2025-07')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        cards = res.data['summary_cards']
        self.assertEqual(cards['total_income']['amount'], 25000.0)
        self.assertEqual(cards['total_expenses']['amount'], 1749.0) # 450 + 1299
        self.assertEqual(cards['total_balance']['amount'], 23251.0) # 25000 - 1749
        self.assertEqual(cards['monthly_budget']['amount'], 15000.0)

    def test_add_transaction(self):
        res = self.client.post('/api/transactions/', {
            'type': 'expense',
            'category_name': 'Travel',
            'amount': '200.00',
            'description': 'Metro Card',
            'date': '2025-07-15'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Transaction.objects.filter(description='Metro Card').count(), 1)

    def test_budget_update(self):
        res = self.client.put('/api/budget/', {
            'month': '2025-07',
            'amount': '20000.00',
            'category_budgets': {'Food': 6000}
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['amount'], 20000.0)

    def test_reports_filtering_and_csv_export(self):
        res = self.client.get('/api/reports/?from=2025-07-01&to=2025-07-31&category=Food')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['transactions']), 1)
        self.assertEqual(res.data['transactions'][0]['description'], 'Zomato Order')

        # CSV export
        csv_res = self.client.get('/api/reports/?from=2025-07-01&to=2025-07-31&export=csv')
        self.assertEqual(csv_res.status_code, status.HTTP_200_OK)
        self.assertEqual(csv_res['Content-Type'], 'text/csv')
        content = csv_res.content.decode('utf-8')
        self.assertIn('Date,Description,Category,Amount (INR),Type', content)
        self.assertIn('Zomato Order', content)

    def test_user_profile_update(self):
        res = self.client.patch('/api/auth/me/', {
            'first_name': 'Yuvan',
            'last_name': 'Kumar',
            'currency': '₹'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['first_name'], 'Yuvan')
        self.assertEqual(res.data['last_name'], 'Kumar')
