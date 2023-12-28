from .models import DailyMenu
from .serializers import DailyMenuSerializer
from .models import Recipe, RecipeItem
from rest_framework import generics, status
from .models import Recipe
from .models import ItemTransfer
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from .serializers import RecipeSerializer
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .serializers import ItemTransferSerializer
from django.contrib.contenttypes.models import ContentType
from .serializers import NotificationSerializer, DishSerializer
from .models import Notification
import json
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .serializers import ItemSerializer, PurchaseHistorySerializer
from .models import Item, PurchaseHistory
from .serializers import RefreshTokenSerializer
from .serializers import TokenVerificationSerializer
from rest_framework_simplejwt.tokens import AccessToken
from .serializers import UserLoginSerializer
from rest_framework import generics
from rest_framework.generics import CreateAPIView
from .models import Item, Dish, DishItem, DishRecipe
from .serializers import ItemSerializer

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser


from .serializers import CustomUserSerializer


class UserRegistrationAPIView(CreateAPIView):
    serializer_class = CustomUserSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({"message": "User registered successfully."}, status=status.HTTP_201_CREATED)


class UserLoginAPIView(CreateAPIView):
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'role': user.role,
        }, status=status.HTTP_200_OK)


class TokenVerificationAPIView(CreateAPIView):
    serializer_class = TokenVerificationSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data['token']

        try:
            decoded_token = AccessToken(token)
            user_id = decoded_token['user_id']
            user = CustomUser.objects.get(id=user_id)
            return Response({"user_id": user_id, "role": user.role}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ObtainAccessTokenAPIView(CreateAPIView):
    serializer_class = RefreshTokenSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        refresh = serializer.validated_data['refresh']

        try:
            refresh_token = RefreshToken(refresh)
            access_token = refresh_token.access_token
            return Response({"access": str(access_token)}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RecipeListCreateAPIView(generics.ListCreateAPIView):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer

    def create(self, request, *args, **kwargs):
        # Extract the items data from the request
        print("qazwsxed")
        items_data = request.data.pop('items', [])
        print("1", items_data)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Create RecipeItem instances and calculate cost and theoretical quantity
        recipe = serializer.instance
        cost = 0
        used_quantity_sum = 0

        for item_data in items_data:
            item_id = item_data['id']
            print("2", item_id)
            used_quantity = item_data['used_quantity']
            print("3", used_quantity)
            item = Item.objects.get(pk=item_id)
            print("4", item)
            # Create RecipeItem instance
            recipe_item = RecipeItem(
                recipe=recipe, item=item, used_quantity=used_quantity)
            print("5", recipe)
            recipe_item.save()

            # Calculate cost and sum used quantities
            cost += used_quantity * item.price
            used_quantity_sum += used_quantity

        # Update Recipe with calculated cost and theoretical quantity
        recipe.cost = cost
        recipe.theoretical_quantity = used_quantity_sum
        recipe.save()

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class ItemRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer


class ItemUpdateByNameAPIView(generics.UpdateAPIView):
    serializer_class = ItemSerializer
    lookup_field = 'name'

    def get_queryset(self):
        name = self.kwargs['name']
        quantity = self.kwargs['quantity']
        try:
            item = Item.objects.get(name=name)
            item.quantity -= quantity
            item.save()
            return Item.objects.filter(id=item.id)
        except Item.DoesNotExist:
            return Item.objects.none()


class RetrieveItemByname(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ItemSerializer
    lookup_field = 'name'

    def get_queryset(self):
        name = self.kwargs['name']
        try:
            return Item.objects.filter(name=name)
        except Item.DoesNotExist:
            return Item.objects.none()


class ItemListCreateAPIView(generics.ListCreateAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer


class ItemRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer


class PurchaseHistoryListAPIView(generics.ListAPIView):
    serializer_class = PurchaseHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        date = self.request.query_params.get('date')
        queryset = PurchaseHistory.objects.all()
        user = self.request.user

        if user.role == 'purchaser':
            if date:
                queryset = queryset.filter(purchase_time__date=date)
            return queryset

        if user.role == 'storeKeeper':
            if date:
                queryset = queryset.filter(
                    purchase_time__date=date, status='pending')
            else:
                queryset = queryset.filter(status='pending')

            return queryset

        return PurchaseHistory.objects.none()


class PurchaseHistoryRemoveItemAPIView(generics.DestroyAPIView):
    serializer_class = PurchaseHistorySerializer

    def delete(self, request, *args, **kwargs):
        purchase_id = self.kwargs.get('purchase_id')
        item_id = self.kwargs.get('item_id')

        try:
            purchase = PurchaseHistory.objects.get(id=purchase_id)

            item = Item.objects.get(id=item_id)
            print("1", item.quantity)

            # Deduct the quantity from the item in the database
            item.quantity -= purchase.items.filter(id=item_id).first().quantity
            purchase.items.remove(item)
            print("2", item.quantity)
            item.save()

            return Response(status=204)
        except (PurchaseHistory.DoesNotExist, Item.DoesNotExist):
            return Response(status=404)


@csrf_exempt
@require_POST
def approve_all_purchases(request):
    try:
        payload = json.loads(request.body)

        purchase_ids = payload.get('purchase_ids', '')

        if purchase_ids:
            try:
                purchase_ids = purchase_ids.split(',')
                PurchaseHistory.objects.filter(
                    id__in=purchase_ids).update(status='approved')
                return JsonResponse({'success': True})
            except Exception as e:
                return JsonResponse({'success': False, 'error': str(e)})
        else:
            return JsonResponse({'success': False, 'message': 'No purchase IDs provided'})
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'message': 'Invalid JSON payload'})


class NotificationListCreateAPIView(generics.ListCreateAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    def perform_create(self, serializer):
        role = self.request.data.get('role')
        # Assuming the entity name is passed in the request data
        entity_name = self.request.data.get('entity_type')
        recipient_users = CustomUser.objects.filter(role=role)

        # Get the ContentType based on the entity name
        entity_type = ContentType.objects.get(model=entity_name.lower())
        chanegdEntityName = Item.objects.get(
            id=self.request.data.get('entity_id'))

        serializer.save(
            recipient_user=recipient_users,
            entity_type_id=entity_type.id,
            chanegdEntityName=chanegdEntityName
        )


class NotificationDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer


class ItemTransferListCreateAPIView(ListCreateAPIView):
    queryset = ItemTransfer.objects.all()
    serializer_class = ItemTransferSerializer


class ItemTransferRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset = ItemTransfer.objects.all()
    serializer_class = ItemTransferSerializer


class RecipeDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer


class DishListCreateAPIView(generics.ListCreateAPIView):
    queryset = Dish.objects.all()
    serializer_class = DishSerializer

    def create(self, request, *args, **kwargs):
        items_data = request.data.pop('items', [])
        recipes_data = request.data.pop('recipes', [])

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        self.perform_create(serializer)

        # Create DishItem instances and associate them with the newly created Dish
        for item_data in items_data:
            item_id = item_data['id']
            used_quantity = item_data['quantity']

            try:
                item = Item.objects.get(pk=item_id)
            except Item.DoesNotExist:
                return Response(
                    {'error': f'Item with ID {item_id} does not exist.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            dish_item = DishItem(dish=serializer.instance,
                                 item=item, quantity=used_quantity)
            dish_item.save()

        # Create DishRecipe instances and associate them with the newly created Dish
        for recipe_data in recipes_data:
            recipe_id = recipe_data['id']
            used_quantity = recipe_data['quantity']

            try:
                recipe = Recipe.objects.get(pk=recipe_id)
            except Recipe.DoesNotExist:
                return Response(
                    {'error': f'Recipe with ID {recipe_id} does not exist.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            dish_recipe = DishRecipe(
                dish=serializer.instance, recipe=recipe, quantity=used_quantity)
            dish_recipe.save()

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class DishDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Dish.objects.all()
    serializer_class = DishSerializer


class DailyMenuDetailView(RetrieveUpdateDestroyAPIView):
    queryset = DailyMenu.objects.all()
    serializer_class = DailyMenuSerializer


class DailyMenuListView(ListCreateAPIView):
    queryset = DailyMenu.objects.all()
    serializer_class = DailyMenuSerializer
