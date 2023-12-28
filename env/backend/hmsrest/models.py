from django.apps import apps
from django.core.serializers import serialize
from django.db.models import JSONField
from django.db.models.signals import pre_save
from django.utils import timezone
from django.utils.timezone import now
from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.utils.translation import gettext_lazy as _
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class CustomUser(AbstractUser):
    groups = models.ManyToManyField(
        Group,
        verbose_name=_('groups'),
        blank=True,
        related_name='customuser_set',
        related_query_name='customuser',
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name=_('user permissions'),
        blank=True,
        related_name='customuser_set',
        related_query_name='customuser',
    )

    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('storeKeeper', 'StoreKeeper'),
        ('purchaser', 'Purchaser'),
        ('cheff', 'Cheff'),
        ('cashier', 'Cashier')
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return self.username


class Item(models.Model):
    name = models.CharField(max_length=100, unique=True)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    expiration_date = models.DateField()
    purchase_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    def create_purchase_history(self):
        purchase_time = self.purchase_time.replace(
            second=0, microsecond=0)  # Truncate seconds and microseconds
        start_time = purchase_time
        # Add 1 minute to create a range
        end_time = purchase_time + timezone.timedelta(minutes=1)

        # Check if an existing PurchaseHistory exists within the range of start_time and end_time
        purchase_history = PurchaseHistory.objects.filter(
            purchase_time__range=(start_time, end_time)).first()

        if not purchase_history:
            purchase_history = PurchaseHistory.objects.create(
                purchase_time=purchase_time, status='pending')

        purchase_history.items.add(self)

        return purchase_history

    def save(self, *args, **kwargs):
        created = not self.pk  # Check if the item is being created for the first time
        super().save(*args, **kwargs)
        if created:
            purchase_history = self.create_purchase_history()
            purchase_history.status = 'pending'
            purchase_history.save()


class PurchaseHistory(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    purchase_time = models.DateTimeField(auto_now_add=True)
    # Define the many-to-many relationship
    items = models.ManyToManyField(Item)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"Purchase History {self.status}"


@receiver(pre_save, sender=Item)
def item_change_handler_pre_save(sender, instance, **kwargs):
    if instance.pk:
        try:
            previous_item = Item.objects.get(pk=instance.pk)
            previous_quantity = previous_item.quantity
            current_quantity = instance.quantity

            if previous_quantity != current_quantity:
                action = 'updated'
                quantity_change = current_quantity - previous_quantity
                if quantity_change > 0:
                    quantity_action = f'added: {quantity_change}'
                elif quantity_change < 0:
                    quantity_action = f'deducted: {abs(quantity_change)}'
                else:
                    quantity_action = 'remained unchanged'

                message = f'Item {action}: {instance.name} (Quantity {quantity_action})'
                channel_layer = get_channel_layer()

                # Send a WebSocket notification to connected clients
                async_to_sync(channel_layer.group_send)(
                    'NotificationGroup',
                    {
                        'type': 'item_changed',
                        'message': message,
                    }
                )
        except Item.DoesNotExist:
            # Item is being created
            pass


@receiver(post_save, sender=Item)
def item_change_handler_post_save(sender, instance, created, **kwargs):
    if created:
        action = 'created'
        quantity_action = f'added: {instance.quantity}'

        message = f'Item {action}: {instance.name} (Quantity {quantity_action})'
        channel_layer = get_channel_layer()

        # Send a WebSocket notification to connected clients
        async_to_sync(channel_layer.group_send)(
            'NotificationGroup',
            {
                'type': 'item_changed',
                'message': message,
            }
        )


@receiver(post_delete, sender=Item)
def item_change_handler_post_delete(sender, instance, **kwargs):
    action = 'deleted'
    # Customize the message as per your requirements
    message = f'Item {action}: {instance.name}'

    channel_layer = get_channel_layer()

    # Send a WebSocket notification to connected clients
    async_to_sync(channel_layer.group_send)(
        'NotificationGroup',
        {
            'type': 'item_changed',
            'message': message,
        }
    )


class Recipe(models.Model):
    name = models.CharField(max_length=100)
    items = models.ManyToManyField(Item, through='RecipeItem')
    error_margin = models.DecimalField(max_digits=5, decimal_places=2)
    cost = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)
    theoretical_quantity = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return self.name


@receiver(post_save, sender=Item)
def update_recipe_cost(sender, instance, **kwargs):
    # Get all recipes associated with the item
    recipes = Recipe.objects.filter(items__id=instance.id)

    for recipe in recipes:
        # Calculate the new cost based on the updated item prices
        cost = 0

        for recipe_item in recipe.items.all():
            item = Item.objects.get(id=recipe_item.id)
            recipeItem = RecipeItem.objects.get(
                recipe=recipe.id, item=recipe_item.id)
            used_quantity = recipeItem.used_quantity

            cost += used_quantity * item.price

        # Update the recipe with the new cost and theoretical quantity
        recipe.cost = cost

        recipe.save()


class RecipeItem(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    used_quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.recipe.name} - {self.item.name}"


class Dish(models.Model):
    name = models.CharField(max_length=100)
    items = models.ManyToManyField(Item, through='DishItem')
    recipes = models.ManyToManyField(Recipe, through='DishRecipe')
    cost = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)
    theoretical_quantity = models.PositiveIntegerField(null=True, blank=True)
    error_margin = models.DecimalField(max_digits=5, decimal_places=2)
    price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return self.name


class DishItem(models.Model):
    dish = models.ForeignKey(Dish, on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.dish.name} - {self.item.name}"


class DishRecipe(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    dish = models.ForeignKey(Dish, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.dish.name} - {self.recipe.name}"


class ItemTransfer(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    request_user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name='requested_transfers', blank=True)
    grant_user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name='granted_transfers', default=1)
    items = JSONField(default=list)
    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"Transfer {self.id}"

    # def save(self, *args, **kwargs):
    #     created = not self.pk  # Check if the object is being created or updated
    #     super().save(*args, **kwargs)
    #     if created:
    #         # Call send_item_transfer if the object is being created
    #         channel_layer = get_channel_layer()
    #         item_transfer =  {'id': self.pk, 'request_user': self.request_user, 'grant_user': self.grant_user, 'items': self.items, 'status': self.status}
    #         print("dfgg",item_transfer)
    #         async_to_sync(channel_layer.group_send)(
    #             'ItemTransferGroup',
    #             {
    #                 'type': 'send_item_transfer',
    #                 'item_transfer': item_transfer,
    #             }
    #         )


class Notification(models.Model):
    recipient_user = models.ManyToManyField(
        CustomUser, related_name='received_notifications')
    entity_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    entity_id = models.PositiveIntegerField()
    chanegdEntityName = models.CharField(max_length=100, blank=True)
    entity = GenericForeignKey('entity_type', 'entity_id')
    action = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    seen = models.BooleanField(default=False)


class DailyMenu(models.Model):
    MENU_TYPES = (
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
    )

    dishes = models.ManyToManyField(Dish)
    menu_type = models.CharField(max_length=20, choices=MENU_TYPES)
    description = models.TextField()
    date = models.DateField(default=timezone.now)

    def __str__(self):
        return self.name
