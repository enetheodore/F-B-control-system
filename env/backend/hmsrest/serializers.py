from .models import Recipe, RecipeItem
from django.db.models import JSONField
from django.contrib.contenttypes.models import ContentType
from .models import Notification
from rest_framework_simplejwt.tokens import TokenError, AccessToken
from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import Item, PurchaseHistory, DailyMenu

from rest_framework import serializers
from rest_framework import serializers
from .models import CustomUser, ItemTransfer, Recipe, Dish, DishItem, DishRecipe


class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'password', 'role']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(style={'input_type': 'password'})

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)

            if user:
                if not user.is_active:
                    raise serializers.ValidationError(
                        "User account is disabled.")
                attrs['user'] = user
                return attrs
            else:
                raise serializers.ValidationError(
                    "Incorrect username or password.")

        raise serializers.ValidationError(
            "Both username and password are required.")


class TokenVerificationSerializer(serializers.Serializer):
    token = serializers.CharField()

    def validate_token(self, value):
        try:
            AccessToken(value)
            return value
        except TokenError:
            raise serializers.ValidationError("Invalid token.")


class RefreshTokenSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'


class PurchaseHistorySerializer(serializers.ModelSerializer):
    # Use the ItemSerializer for the items field
    items = ItemSerializer(many=True)

    class Meta:
        model = PurchaseHistory
        fields = ['id', 'purchase_time', 'items', 'status']


class NotificationSerializer(serializers.ModelSerializer):
    recipient_user = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=CustomUser.objects.all(),
        required=False
    )
    # Add write_only field for entity_type
    entity_type = serializers.CharField(write_only=True)
    entity_type_name = serializers.SerializerMethodField(
        read_only=True)  # Add SerializerMethodField for entity_type_name

    class Meta:
        model = Notification
        fields = '__all__'

    def get_entity_type_name(self, obj):
        return obj.entity_type.model  # Retrieve the model name of the entity_type

    def create(self, validated_data):
        entity_name = validated_data.pop('entity_type')
        entity_type = ContentType.objects.get(model=entity_name.lower())
        validated_data['entity_type'] = entity_type
        return super().create(validated_data)


class ItemTransferSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemTransfer
        fields = ['id', 'request_user', 'grant_user', 'items', 'status']
        read_only_fields = ['id']


class ItemTransferSerializer2(serializers.ModelSerializer):
    class Meta:
        model = ItemTransfer
        fields = ['id', 'request_user', 'grant_user', 'items', 'status']
        read_only_fields = ['id']


class ItemSerializerforRecipe(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ('name', 'id')


class RecipeItemSerializer(serializers.ModelSerializer):
    item = ItemSerializerforRecipe()

    class Meta:
        model = RecipeItem
        fields = ('item', 'used_quantity')


class RecipeSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = ('id', 'name', 'error_margin', 'cost',
                  'theoretical_quantity', 'items')

    def get_items(self, obj):
        recipe_items = RecipeItem.objects.filter(recipe=obj)
        serializer = RecipeItemSerializer(recipe_items, many=True)
        return serializer.data


class DishItemSerializer(serializers.ModelSerializer):
    item = ItemSerializerforRecipe()

    class Meta:
        model = DishItem
        fields = ('item', 'quantity')


class DishRecipeSerializer(serializers.ModelSerializer):
    recipe = RecipeSerializer()

    class Meta:
        model = DishRecipe
        fields = ('recipe', 'quantity')


class DishSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    recipes = serializers.SerializerMethodField()

    class Meta:
        model = Dish
        fields = ('id', 'name', 'error_margin', 'cost',
                  'theoretical_quantity', 'items', 'recipes', 'price')

    def get_items(self, obj):
        dish_items = DishItem.objects.filter(dish=obj)
        serializer = DishItemSerializer(dish_items, many=True)
        return serializer.data

    def get_recipes(self, obj):
        dish_recipes = DishRecipe.objects.filter(dish=obj)
        serializer = DishRecipeSerializer(dish_recipes, many=True)
        return serializer.data


class DishSerliserForDailyMenu(serializers.ModelSerializer):
    class Meta:
        model = Dish
        fields = ('id', 'name', 'error_margin', 'cost',
                  'theoretical_quantity', 'price')


class DailyMenuSerializer(serializers.ModelSerializer):
    # dishes = DishSerliserForDailyMenu(many=True)

    class Meta:
        model = DailyMenu
        fields = '__all__'
