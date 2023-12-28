from django.urls import path
from .views import NotificationDetailAPIView, NotificationListCreateAPIView, ObtainAccessTokenAPIView, UserRegistrationAPIView, UserLoginAPIView, TokenVerificationAPIView, approve_all_purchases, ItemListCreateAPIView, ItemRetrieveUpdateDestroyAPIView, ItemUpdateByNameAPIView, PurchaseHistoryListAPIView, PurchaseHistoryRemoveItemAPIView
from .views import ItemTransferListCreateAPIView, ItemTransferRetrieveUpdateDestroyAPIView
from .views import RecipeDetailView, RetrieveItemByname, RecipeListCreateAPIView, DishListCreateAPIView, DishDetailView
from .views import DailyMenuDetailView, DailyMenuListView
urlpatterns = [
    path('register/', UserRegistrationAPIView.as_view(), name='register'),
    path('login/', UserLoginAPIView.as_view(), name='token'),
    path('verify-token/', TokenVerificationAPIView.as_view(), name='verify-token'),
    path('obtain-access-token/', ObtainAccessTokenAPIView.as_view(),
         name='obtain-access-token'),
    path('items/', ItemListCreateAPIView.as_view(), name='item-list-create'),
    path('items/<int:pk>/', ItemRetrieveUpdateDestroyAPIView.as_view(),
         name='item-retrieve-update-delete'),
    path('items/name/<str:name>/quantity/<int:quantity>/',
         ItemUpdateByNameAPIView.as_view(), name='item-update-by-name'),
    path('items/itemname/<str:name>/', RetrieveItemByname.as_view(),
         name='retrieve-item-by-name'),
    path('purchase-history/', PurchaseHistoryListAPIView.as_view(),
         name='purchase-history-list'),
    path('purchase-history/<int:purchase_id>/remove-item/<int:item_id>/',
         PurchaseHistoryRemoveItemAPIView.as_view(), name='purchase-history-remove-item'),
    path('purchase-history/approve-all/',
         approve_all_purchases, name='approve_all_purchases'),
    path('notifications/', NotificationListCreateAPIView.as_view(),
         name='notification-list'),
    path('notifications/<int:pk>/', NotificationDetailAPIView.as_view(),
         name='notification-detail'),
    path('item-transfers/', ItemTransferListCreateAPIView.as_view(),
         name='item-transfer-list-create'),
    path('item-transfers/<int:pk>/', ItemTransferRetrieveUpdateDestroyAPIView.as_view(),
         name='item-transfer-retrieve-update-destroy'),
    path('recipes/', RecipeListCreateAPIView.as_view(), name='recipe-list'),
    path('recipes/<int:pk>/', RecipeDetailView.as_view(), name='recipe-detail'),
    path('dishes/', DishListCreateAPIView.as_view(), name='dish-list-create'),
    path('dishes/<int:pk>/', DishDetailView.as_view(), name='dish-detail'),
    path('daily-menus/', DailyMenuListView.as_view(), name='daily-menu-list'),
    path('daily-menus/<int:pk>/', DailyMenuDetailView.as_view(),
         name='daily-menu-detail'),

]
