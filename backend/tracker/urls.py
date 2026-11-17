from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView,
    RegisterView,
    LogoutView,
    CurrentUserView,
    CategoryViewSet,
    TransactionViewSet,
    BudgetView,
    DashboardSummaryView,
    ReportsView
)

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = [
    # Auth endpoints
    path('auth/login/', LoginView.as_view(), name='token_obtain_pair'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', CurrentUserView.as_view(), name='current_user'),

    # Core endpoints
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard_summary'),
    path('budget/', BudgetView.as_view(), name='budget'),
    path('reports/', ReportsView.as_view(), name='reports'),

    # Router endpoints (transactions, categories)
    path('', include(router.urls)),
]
