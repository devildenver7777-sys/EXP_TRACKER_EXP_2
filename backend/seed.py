import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import django
from decimal import Decimal

# Set up django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from tracker.models import Category, Transaction, MonthlyBudget, UserProfile

def seed():
    print("Clearing old data...")
    Transaction.objects.all().delete()
    Category.objects.all().delete()
    MonthlyBudget.objects.all().delete()
    UserProfile.objects.all().delete()
    User.objects.filter(username='yuvan').delete()

    print("Creating user Yuvan...")
    user = User.objects.create_user(
        username='yuvan',
        email='yuvan@example.com',
        password='password123',
        first_name='Yuvan',
        last_name=''
    )
    user.is_staff = True
    user.is_superuser = True
    user.save()

    profile = UserProfile.objects.create(
        user=user,
        avatar_url='',
        currency='₹'
    )

    print("Creating categories...")
    categories = {
        'Food': Category.objects.create(
            name='Food', type='expense', icon='utensils', color='#3b82f6',
            badge_bg='#eff6ff', badge_color='#2563eb'
        ),
        'Shopping': Category.objects.create(
            name='Shopping', type='expense', icon='shopping-cart', color='#f97316',
            badge_bg='#fff7ed', badge_color='#ea580c'
        ),
        'Travel': Category.objects.create(
            name='Travel', type='expense', icon='bus', color='#10b981',
            badge_bg='#f5f3ff', badge_color='#7c3aed'
        ),
        'Bills': Category.objects.create(
            name='Bills', type='expense', icon='zap', color='#8b5cf6',
            badge_bg='#fefce8', badge_color='#ca8a04'
        ),
        'Others': Category.objects.create(
            name='Others', type='expense', icon='tag', color='#eab308',
            badge_bg='#fefce8', badge_color='#a16207'
        ),
        'Income': Category.objects.create(
            name='Income', type='income', icon='briefcase', color='#10b981',
            badge_bg='#f0fdf4', badge_color='#16a34a'
        ),
    }

    print("Creating July 2025 Budget...")
    MonthlyBudget.objects.create(
        user=user,
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

    print("Creating transactions...")
    # Exact recent transactions displayed in table
    Transaction.objects.create(
        user=user,
        type='expense',
        category=categories['Food'],
        category_name='Food',
        amount=Decimal('450.00'),
        description='Zomato Order',
        date='2025-07-19'
    )
    Transaction.objects.create(
        user=user,
        type='expense',
        category=categories['Shopping'],
        category_name='Shopping',
        amount=Decimal('1299.00'),
        description='Amazon Purchase',
        date='2025-07-18'
    )
    Transaction.objects.create(
        user=user,
        type='income',
        category=categories['Income'],
        category_name='Income',
        amount=Decimal('25000.00'),
        description='Salary',
        date='2025-07-17'
    )
    Transaction.objects.create(
        user=user,
        type='expense',
        category=categories['Travel'],
        category_name='Travel',
        amount=Decimal('200.00'),
        description='Metro Card',
        date='2025-07-15'
    )
    Transaction.objects.create(
        user=user,
        type='expense',
        category=categories['Bills'],
        category_name='Bills',
        amount=Decimal('1800.00'),
        description='Electricity Bill',
        date='2025-07-14'
    )

    # Additional July 2025 transactions to match exact donut chart totals
    # Food target: 4,000 (currently 450 -> add 3,550)
    Transaction.objects.create(
        user=user,
        type='expense',
        category=categories['Food'],
        category_name='Food',
        amount=Decimal('2350.00'),
        description='Weekly Grocery Store',
        date='2025-07-10'
    )
    Transaction.objects.create(
        user=user,
        type='expense',
        category=categories['Food'],
        category_name='Food',
        amount=Decimal('1200.00'),
        description='Team Dinner Outing',
        date='2025-07-05'
    )

    # Shopping target: 2,500 (currently 1,299 -> add 1,201)
    Transaction.objects.create(
        user=user,
        type='expense',
        category=categories['Shopping'],
        category_name='Shopping',
        amount=Decimal('1201.00'),
        description='Apparel & Sneakers',
        date='2025-07-08'
    )

    # Travel target: 2,000 (currently 200 -> add 1,800)
    Transaction.objects.create(
        user=user,
        type='expense',
        category=categories['Travel'],
        category_name='Travel',
        amount=Decimal('950.00'),
        description='Airport Cab Ride',
        date='2025-07-04'
    )
    Transaction.objects.create(
        user=user,
        type='expense',
        category=categories['Travel'],
        category_name='Travel',
        amount=Decimal('850.00'),
        description='Express Train Ticket',
        date='2025-07-01'
    )

    # Bills target: 2,000 (currently 1,800 -> add 200)
    Transaction.objects.create(
        user=user,
        type='expense',
        category=categories['Bills'],
        category_name='Bills',
        amount=Decimal('200.00'),
        description='Mobile Data Recharge',
        date='2025-07-02'
    )

    # Others target: 2,050 (Jul 12: 850, Jul 06: 1200) -> total expenses = 12,550!
    Transaction.objects.create(
        user=user,
        type='expense',
        category=categories['Others'],
        category_name='Others',
        amount=Decimal('850.00'),
        description='IMAX Movie Tickets',
        date='2025-07-12'
    )
    Transaction.objects.create(
        user=user,
        type='expense',
        category=categories['Others'],
        category_name='Others',
        amount=Decimal('1200.00'),
        description='Tech Books & Journal',
        date='2025-07-06'
    )

    # Seed June 2025 transactions for realistic percentage comparisons
    # June: Income 23,800 (+5% to 25k), Expense 12,184 (+3% to 12,550), Balance 11,528 (+8% to 12,450)
    Transaction.objects.create(
        user=user,
        type='income',
        category=categories['Income'],
        category_name='Income',
        amount=Decimal('23800.00'),
        description='June Salary',
        date='2025-06-30'
    )
    Transaction.objects.create(
        user=user,
        type='expense',
        category=categories['Bills'],
        category_name='Bills',
        amount=Decimal('12184.00'),
        description='June Consolidated Expenses',
        date='2025-06-25'
    )

    print("Seeding completed successfully!")

if __name__ == '__main__':
    seed()
